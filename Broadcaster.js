import md5 from "./Hash/Md5.js";
import Storage from "./BrowserStorage";
import Window from "./Window.js";
import {
    clone,
    each,
    is_async_function,
    empty,
    is_function,
    is_null,
    is_object,
    is_string,
    uuid_v4,
    is_md5
} from "./Helper";

const listening = {};
const sending = {};
const delayPeriod = 1; // 2 seconds
let BroadcasterObject = null,
    hashStorage = Storage.getItem('_broadcaster_hash'),
    everOpen = false,
    Listener = {
        error: {},
        message: {},
    },
    ActionListener = {
        error: {},
        message: {}
    };
const hasProcess = is_object(process) && is_object(process.env);
if (hasProcess && process.env.BROADCASTER_HASH) {
    if (hashStorage !== process.env.BROADCASTER_HASH) {
        Storage.setItem('_broadcaster_hash', process.env.BROADCASTER_HASH);
    }
    hashStorage = process.env.BROADCASTER_HASH;
}
hashStorage = hashStorage || md5(__dirname||'');
if (!is_md5(hashStorage)) {
    hashStorage = md5(hashStorage);
    Storage.setItem('_broadcaster_hash', hashStorage);
}
if (hasProcess) {
    process.env.BROADCASTER_HASH = hashStorage;
}

const createBroadcaster = () => {
    const
        loc = Window.location,
        nav = Window.navigator,
        isValidEvent = (event) => event
            && is_object(event)
            && is_object(event.data)
            && is_string(event.data.action)
            && is_string(event.data.hash)
            && is_string(event.data.type);
    BroadcasterObject = new BroadcastChannel(
        md5(loc.origin + nav.userAgent + hashStorage)
    );
    BroadcasterObject.onmessage = (event) => {
        if (!isValidEvent(event)) {
            return;
        }

        const action = event.data.action;
        const type = event.data.type;
        const hash = event.data.hash;
        const round = Math.round(new Date().getTime() / 1000);
        if (listening[hash] && (round - listening[hash]) < delayPeriod) {
            return;
        }
        const newEvent = new BroadCastMessage(event, 'message');
        listening[hash] = round;
        const listeners = [];
        if (Listener.message[action]) {
            listeners.push(...Object.values(Listener.message[action]));
        }

        if (ActionListener.message[action]) {
            for (let actionType in ActionListener.message[action]) {
                if (type !== actionType) {
                    continue;
                }
                listeners.push(...Object.values(ActionListener.message[action][type]));
            }
        }

        Promise.all(listeners.map(e => e(newEvent))).then(e=>e).catch(e=>e);
        // delete
        each(listening, (key, value) => {
            if ((round - value) > delayPeriod) {
                delete sending[key];
            }
        });
    };

    BroadcasterObject.onmessageerror = (event) => {
        if (!is_object(event)
            || !is_string(event.type)
            || !is_string(event.action)
        ) {
            return;
        }

        event = new MessageEvent('messageerror', event);
        const action = event.data.action;
        const actionType = event.data.type;
        // let hash = event.hash || null;
        // let data;
        // if (!hash) {
        //     try {
        //         if (is_object(event.data)) {
        //             data = event.data.message;
        //         }
        //     } catch (e) {
        //         data = event.data;
        //     }
        // }
        // hash = hash || md5(JSON.stringify([action, actionType, data]));
        const newEvent = new BroadCastMessage(event, 'error');
        const listeners = [];
        if (Listener.message[action]) {
            listeners.push(...Object.values(Listener.error[action]));
        }
        if (ActionListener.error[action]) {
            for (let type in ActionListener.error[action]) {
                if (type !== actionType) {
                    continue;
                }
                listeners.push(...Object.values(ActionListener.error[action][type]));
            }
        }
        Promise.all(listeners.map(e => e(newEvent))).then(e=>e).catch(e=>e);
    };

    return BroadcasterObject;
}
const $broadcaster = () => BroadcasterObject || (everOpen ? null : (BroadcastOpen() ? BroadcasterObject : null));
const broadCastRemove = (type, action, callback) => {
    if (!type || !Listener[type] || !is_string(action)) {
        return false;
    }
    if (!Listener[type][action]) {
        return false;
    }

    if (is_null(callback)) {
        delete Listener[type][action];
        return true;
    }
    if (!is_function(callback)) {
        return false;
    }

    const hash = md5(callback.toString());
    if (!Listener[type][action][hash]) {
        return false;
    }
    delete Listener[type][action][hash];
    if (empty(Listener[type][action])) {
        delete Listener[type][action];
    }
    return true;
}
const broadCastAdd = (type, action, callback) => {
    if (!Listener[type]
        || !is_string(action)
        || !is_function(callback)
    ) {
        return false;
    }

    const hash = md5(callback.toString());
    if (!Listener[type][action]) {
        Listener[type][action] = {};
    }
    let cb;
    if (!is_async_function(callback)) {
        cb = (event) => Promise.resolve(callback(event));
    } else {
        cb = (event) => callback(event).then(e=>e).catch(e=>e);
    }

    Listener[type][action][hash] = cb;
    return true;
}
const broadCastAddActionType = (broadcastType, action, type, callback) => {
    if ((broadcastType !== 'message' && broadcastType !== 'error')
        || !ActionListener[broadcastType]
        || !is_string(action)
        || !is_string(type)
        || !is_function(callback)
    ) {
        return false;
    }
    if (!ActionListener[broadcastType][action]) {
        ActionListener[broadcastType][action] = {};
    }

    const hash = md5(callback.toString());
    let cb;
    if (!is_async_function(callback)) {
        cb = (event) => Promise.resolve(callback(event));
    } else {
        cb = (event) => callback(event).then(e=>e).catch(e=>e);
    }

    if (!ActionListener[broadcastType][action][type]) {
        ActionListener[broadcastType][action][type] = {};
    }
    ActionListener[broadcastType][action][type][hash] = cb;
    return true;
}
const broadCastRemoveActionType = (broadcastType, action, type, callback) => {
    if ((broadcastType !== 'message' && broadcastType !== 'error')
        || !ActionListener[broadcastType]
        || !is_string(action)
    ) {
        return false;
    }
    if (!ActionListener[broadcastType][action]) {
        return false;
    }
    if (type === null) {
        if (is_null(callback)) {
            delete ActionListener[broadcastType][action];
            return true;
        }
        if (!is_function(callback)) {
            return false;
        }
        const hash = md5(callback.toString());
        for (let type in ActionListener[broadcastType][action]) {
            if (ActionListener[broadcastType][action][type][hash]) {
                delete ActionListener[broadcastType][action][type][hash];
                if (empty(ActionListener[broadcastType][action][type])) {
                    delete ActionListener[broadcastType][action][type];
                }
            }
        }
        if (empty(ActionListener[broadcastType][action])) {
            delete ActionListener[broadcastType][action];
        }
        return true;
    }
    if (!is_string(type)) {
        return false;
    }
    if (!ActionListener[broadcastType][action][type]) {
        return false;
    }
    if (is_null(callback)) {
        delete ActionListener[broadcastType][action][type];
        if (empty(ActionListener[broadcastType][action])) {
            delete ActionListener[broadcastType][action];
        }
        return true;
    }
    if (!is_function(callback)) {
        return false;
    }
    const hash = md5(callback.toString());
    if (!ActionListener[broadcastType][action][type][hash]) {
        return false;
    }
    delete ActionListener[broadcastType][action][type][hash];
    if (empty(ActionListener[broadcastType][action][type])) {
        delete ActionListener[broadcastType][action][type];
    }
    if (empty(ActionListener[broadcastType][action])) {
        delete ActionListener[broadcastType][action];
    }
    return true;
}

export const BroadcastPostMessage = (action, type, message) => {
    const $broadcast = $broadcaster();
    if (!$broadcast) {
        return false;
    }

    const hash = md5(JSON.stringify([action, type, message]));
    const round = Math.round(new Date().getTime() / 1000);
    // do not force the message to be sent into loop
    if (sending[hash] && (round - sending[hash]) < delayPeriod) {
        // dont send
        return;
    }

    sending[hash] = round;
    if (message && is_object(message)) {
        message = JSON.parse(JSON.stringify(message));
    }

    $broadcast.postMessage({action, type, message, hash, referer: Window.location.href});
    // delete
    each(sending, (key, value) => {
        if ((round - value) > delayPeriod) {
            delete sending[key];
        }
    });

    return true;
}
export const BroadcastClear = () => {
    Listener.error = {};
    Listener.message = {};
    ActionListener = {};
    return true;
}
export const BroadcastClose = () => {
    BroadcasterObject?.close();
    BroadcasterObject = null;
}
export const BroadcastOpen  = () => {
    BroadcasterObject = BroadcasterObject || createBroadcaster();
    return true;
}
export const BroadcastOpened = () => !!BroadcasterObject;
export const BroadcastClosed = () => !BroadcasterObject;
export const BroadcastListenMessage = (action, callback) => broadCastAdd('message', action, callback);
export const BroadcastListenError = (action, callback) => broadCastAdd('error', action, callback);
export const BroadcastRemoveOnMessage = (action, callback) => broadCastRemove('message', action, callback);
export const BroadcastRemoveOnError = (action) => broadCastRemove('error', action);
export const BroadcastListenMessageType = (action, type, callback) => broadCastAddActionType('message', action, type, callback);
export const BroadcastListenErrorType = (action, type, callback) => broadCastAddActionType('error', action, type, callback);
export const BroadcastRemoveListenMessageType = (action, type, callback) => broadCastRemoveActionType('message', action, type, callback);
export const BroadcastRemoveListenErrorType = (action, type, callback) => broadCastRemoveActionType('error', action, type, callback);
export const BroadcastHasMessageType = (action, type) => ActionListener.message[action] && ActionListener.message[action][type];
export const BroadcastHasErrorType = (action, type) => ActionListener.error[action] && ActionListener.error[action][type];
export const BroadcastListeners = () => clone(Listener);
export const BroadcastActionTypes = () => clone(ActionListener);

class BroadCastMessage {
    constructor(event, type) {
        const data = event.data;
        // freeze
        this.data = data;
        this.action = data.action;
        this.type = data.type;
        this.message = data.message;
        this.referer = data.referer;
        this.timestamp = event.timeStamp;
        this.time = new Date().getTime();
        this.lastEventId = event.lastEventId;
        this.origin = event.origin;
        this.source = event.source;
        this.ports = event.ports;
        this.eventPhase = event.eventPhase;
        this.kind = type;
        this.uuid = uuid_v4();
        this.hash = data.hash || md5(JSON.stringify([this.action, this.type, this.message]));
        return Object.freeze(this);
    }
}

class Broadcaster {
    constructor() {
        this.postMessage = BroadcastPostMessage;
        this.clear = BroadcastClear;
        this.close = BroadcastClose;
        this.open = BroadcastOpen;
        this.opened = BroadcastOpened;
        this.closed = BroadcastClosed;
        this.listenMessage = BroadcastListenMessage;
        this.listenError = BroadcastListenError;
        this.removeOnMessage = BroadcastRemoveOnMessage;
        this.removeOnError = BroadcastRemoveOnError;
        this.listenMessageType = BroadcastListenMessageType;
        this.listenErrorType = BroadcastListenErrorType;
        this.removeListenMessageType = BroadcastRemoveListenMessageType;
        this.removeListenErrorType = BroadcastRemoveListenErrorType;
        this.hasMessageType = BroadcastHasMessageType;
        this.hasErrorType = BroadcastHasErrorType;
        this.listeners = BroadcastListeners;
        this.actionTypes = BroadcastActionTypes;
        return Object.freeze(this)
    }
}

export default new Broadcaster();
