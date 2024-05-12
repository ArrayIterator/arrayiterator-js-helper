class Idle {
    constructor() {
        let idle_time = null;
        let interval  = null;
        let hold = false;
        this.reset = () => {
            hold = false;
            idle_time = 0;
            if (interval) {
                clearInterval(interval);
            }
            interval = setInterval(() => idle_time++, 1000);
        };

        this.isIdle = (seconds) => {
            return this.idleTime() >= seconds;
        }
        this.idleTime = () => {
            return idle_time;
        }
        this.hold = () => {
            hold = true;
        }
        this.isOnHold = () => {
            return hold;
        }
        this.unHold = () => {
            hold = false;
        }
        const doReset = () => {
            if (hold) {
                return;
            }
            idle_time = 0;
        }

        this.reset();
        [
            'load',
            'mousemove',
            'click',
            'keypress',
            'keydown',
            'scroll',
            'resize',
            'touchstart',
            'touchmove',
        ].forEach((event) => {
            if (!window || typeof window !== 'object' || typeof window.addEventListener !== 'function') {
                return;
            }
            window.addEventListener(event, doReset)
        });
        return Object.freeze(this);
    }
}

export default new Idle()
