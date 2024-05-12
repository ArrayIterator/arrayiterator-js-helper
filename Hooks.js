import md5 from "./Hash/Md5.js";
import {clone, count, is_function, is_not_empty_string, is_numeric, is_string, keys, values} from "./Helper";

/**
 * Hooks
 * @type {{strings: {number: function[]}}} $hooks
 * @type {{strings: {strings: number[]}}} $hooks
 * @type {{strings: {strings: number[]}}} $hooks
 */
const $hooks = {};
const $queue = {};
const $called = {};

/**
 * Add hook
 *
 * @param {string} name the hook name
 * @param {function} callback the callback function
 * @param {number} priority the priority of hook, default is 10
 * @returns {boolean}
 */
export const attach = (name, callback, priority = 10) => {
    if (!name
        || !is_not_empty_string(name)
        || !is_function(callback)
    ) {
        return false;
    }

    if (!$hooks[name]) {
        $hooks[name] = {};
    }
    priority = is_numeric(priority) ? priority : 10;
    if (!$hooks[name][priority]) {
        $hooks[name][priority] = [];
    }
    const hash = md5(callback.toString());
    if ($hooks[name][priority].indexOf(hash) === -1) {
        $hooks[name][priority].push(hash);
    }

    return true;
}

/**
 * Check if hook is exist
 *
 * @param {string} name hook name
 * @param {function|null} callback - if null, check if hook is exist
 * @param {number|null} priority - if null, check if hook is exist
 * @returns {boolean} true if hook is exist
 */
export const contain = (name, callback, priority = null) => {
    if (!name || !is_string(name) || !$hooks[name]) {
        return false;
    }

    const hash = is_function(callback) ? md5(callback.toString()) : null;
    priority = is_numeric(priority) ? priority : null;
    if (priority !== null) {
        if (!$hooks[name][priority]) {
            return false;
        }
    }

    if (hash === null) {
        return true;
    }
    if (priority !== null) {
        return $hooks[name][priority].indexOf(hash) !== -1;
    }

    for (let i in $hooks[name]) {
        if ($hooks[name][i].indexOf(hash) !== -1) {
            return true;
        }
    }
    return false;
}

/**
 * Remove hook
 *
 * @param {string} name
 * @param {function|null} callback - if null, remove all callback
 * @param {number} priority - if null, remove all priority
 * @return {number} integer number of removed
 */
export const detach = (name, callback, priority = 10) => {
    if (!name ||!is_string( name ) || !$hooks[name]) {
        return 0;
    }

    let removedCount = 0;
    priority = is_numeric(priority) ? priority : null;
    const hash = is_function(callback) ? md5(callback.toString()) : null;
    if (priority !== null) {
        if (!$hooks[name][priority]) {
            return 0;
        }
        if (hash === null) {
            removedCount = $hooks[name][priority].length;
            delete $hooks[name][priority];
            return removedCount;
        }
        const index = $hooks[name][priority].indexOf(hash);
        if (index !== -1) {
            $hooks[name][priority].splice(index, 1);
            removedCount++;
        }
        return removedCount;
    }
    for (let i in $hooks[name]) {
        if (hash === null) {
            removedCount += $hooks[name][i].length;
            delete $hooks[name][i];
            continue;
        }
        const index = $hooks[name][i].indexOf(hash);
        if (index !== -1) {
            $hooks[name][i].splice(index, 1);
            removedCount++;
        }
    }
    return removedCount;
}
export const detachAll = (name) => {
    if (!name || !is_string(name) || !$hooks[name]) {
        return 0;
    }
    const removedCount = count($hooks[name]);
    delete $hooks[name];
    return removedCount;
}

export const names = () => {
    return keys($hooks);
}

/**
 * Dispatch hook
 *
 * @template T of any
 * @param {string} name
 * @param {T} arg
 * @param {any} args
 * @param {...any} args
 * @returns {Promise<any>}
 */
export const dispatch = (name, arg = null, ...args) => {
    return new Promise(async (resolve, reject) => {
        const _arguments = values(args);
        if (!name || !is_string(name) || !$hooks[name]) {
            resolve(_arguments[0]);
            return;
        }
        // sort priority of object
        const _hooks = {};
        keys($hooks[name]).sort((a, b) => a - b).forEach((key) => {
            _hooks[key] = $hooks[name][key];
        });
        $hooks[name] = _hooks;
        const hooks = clone($hooks[name]);
        try {
            if (!$queue[name]) {
                $queue[name] = {};
            }
            // doing queue
            for (let priority in hooks) {
                for (let hash in hooks[priority]) {
                    // skip
                    if ($queue[name][hash] !== undefined) {
                        continue;
                    }
                    const hook = hooks[priority][hash];
                    try {
                        if (!$called[name]) {
                            $called[name] = {};
                        }
                        if (!$called[name][hash]) {
                            $called[name][hash] = 0;
                        }
                        $called[name][hash]++;
                        $queue[name][hash] = priority;
                        if (hook.constructor.name === 'AsyncFunction') {
                            _arguments[0] = await hook(..._arguments)
                                .then((e) => e);
                        } else {
                            _arguments[0] = hook(..._arguments);
                        }
                    } finally {
                        delete $queue[name][hash];
                    }
                }
            }
        } catch (error) {
            return reject({
                error,
                name,
                argument: [..._arguments]}
            );
        } finally {
            if (count($queue[name]) === 0) {
                delete $queue[name];
            }
        }
    });
}

/**
 * Run hook without result & reduce error
 *
 * @param {string} name
 * @param {any} arg
 * @param {...any} args
 */
export const run = (name, arg = null, ...args) => {
    dispatch(name, arg, ...args).then((e) => e).catch((e) => e);
}

/**
 * Check if hook is dispatching
 *
 * @param {string} name
 * @param {Function|null} callback
 * @returns {boolean}
 */
export const dispatching = (name, callback) => {
    if (!name || !is_string(name) || !$queue[name]) {
        return false;
    }
    const hash = is_function('function') ? md5(callback.toString()) : null;
    if (hash === null) {
        return true;
    }
    return $queue[name][hash] !== undefined;
}

/**
 * Get number of dispatched
 *
 * @param {string} name
 * @param {Function|null} callback
 * @return {number}
 */
export const dispatched = (name, callback) => {
    if (!name || !is_string(name) || !$called[name]) {
        return 0;
    }
    const hash = is_function(callback) ? md5(callback.toString()) : null;
    if (hash === null) {
        return count($called[name]);
    }

    return $called[name][hash] || 0;
}

export const queue = () => {
    return clone($queue);
}
export const called = () => {
    return clone($called);
}
export const hooks = () => {
    return clone($hooks);
}

export const Hooks = {
    attach,
    names,
    contain,
    detach,
    detachAll,
    dispatch,
    run,
    dispatching,
    dispatched,
    queue,
    called,
    hooks,
};

export default Hooks;
