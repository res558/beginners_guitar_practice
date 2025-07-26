import { createTimer } from './timer.js';

/**
 * Creates a "Get Ready" countdown with cancellation support
 * @param {HTMLElement} container - Container element to show countdown in
 * @returns {Object} Countdown controller with promise and cancel method
 */
export function getReady(container) {
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.style.fontSize = '2em';
    messageEl.style.textAlign = 'center';
    messageEl.style.margin = '20px';
    container.appendChild(messageEl);

    // Create and configure timer
    const timer = createTimer(
        5, // 4 seconds countdown + 1 second "Start!"
        (remaining) => {
            if (remaining === 0) {
                messageEl.textContent = 'Start!';
            } else {
                messageEl.textContent = `Get Ready... ${remaining}`;
            }
        },
        () => {
            // Cleanup on complete
            messageEl.remove();
        },
        () => {
            // Cleanup on cancel
            messageEl.remove();
        }
    );

    // Start the countdown
    timer.start();

    return {
        promise: timer.promise,
        cancel: () => timer.cancel()
    };
}
