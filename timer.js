/**
 * Creates a countdown timer with pause/resume and cancellation capability
 * @param {number} totalSeconds - Total seconds to count down from
 * @param {function} onTick - Callback function called every second with remaining time
 * @param {function} onComplete - Callback function called when timer reaches zero
 * @param {function} onCancel - Callback function called when timer is cancelled
 * @returns {Object} Timer controller object
 */
export function createTimer(totalSeconds, onTick, onComplete, onCancel) {
    let remaining = totalSeconds;
    let timerId = null;
    let lastTick = 0;
    let isCancelled = false;
    let resolvePromise = null;
    let rejectPromise = null;
    
    // Create a promise that can be rejected on cancel
    const timerPromise = new Promise((resolve, reject) => {
        resolvePromise = resolve;
        rejectPromise = reject;
    });

    /**
     * Internal tick handler
     */
    function tick() {
        if (isCancelled) return;
        
        if (remaining <= 0) {
            stop();
            onComplete?.();
            resolvePromise?.();
            return;
        }

        remaining--;
        onTick?.(remaining);
    }

    /**
     * Starts or resumes the timer
     */
    function start() {
        if (timerId || isCancelled) return; // Already running or cancelled
        
        lastTick = Date.now();
        timerId = setInterval(() => {
            const now = Date.now();
            const elapsed = Math.floor((now - lastTick) / 1000);
            
            // Handle case where browser tab was inactive
            if (elapsed > 1) {
                remaining = Math.max(0, remaining - elapsed);
                if (!isCancelled) {
                    onTick?.(remaining);
                }
                
                if (remaining <= 0 || isCancelled) {
                    stop();
                    if (!isCancelled) {
                        onComplete?.();
                        resolvePromise?.();
                    }
                    return;
                }
            } else {
                tick();
            }
            
            lastTick = now;
        }, 1000);
    }

    /**
     * Pauses the timer
     */
    function pause() {
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
        }
    }

    /**
     * Resumes the timer from last paused state
     */
    function resume() {
        if (!isCancelled) {
            start();
        }
    }

    /**
     * Stops and resets the timer
     */
    function stop() {
        pause();
        remaining = totalSeconds;
    }

    /**
     * Cancels the timer permanently
     */
    function cancel() {
        if (!isCancelled) {
            isCancelled = true;
            pause();
            onCancel?.();
            rejectPromise?.(new Error('Timer cancelled'));
        }
    }

    /**
     * Gets remaining time in seconds
     * @returns {number} Remaining seconds
     */
    function getRemaining() {
        return remaining;
    }

    return {
        start,
        pause,
        resume,
        stop,
        cancel,
        getRemaining,
        promise: timerPromise,
        get isCancelled() { return isCancelled; }
    };
}
