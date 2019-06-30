(function() {

    // Vars.
        var $form = document.querySelectorAll('#contact')[0],
            // $name = document.querySelectorAll('#name')[0],
            // $email = document.querySelectorAll('#email')[0],
            // $message = document.querySelectorAll('#message')[0],
            $submit = document.querySelectorAll('#contact input[type="submit"]')[0];
            $message;

    // Bail if addEventListener isn't supported.
        if (!('addEventListener' in $form))
            return;

    // Message.
        $message = document.createElement('span');
            $message.classList.add('message');
            $form.appendChild($message);

        $message1._show = function(type, text) {

            $message1.innerHTML = text;
            $message1.classList.add(type);
            $message1.classList.add('visible');

            window.setTimeout(function() {
                $message._hide();
            }, 3000);

        };

        $message1._hide = function() {
            $message.classList.remove('visible');
        };

    // Events.
    // Note: If you're *not* using AJAX, get rid of this event listener.
        $form.addEventListener('submit', function(event) {

            event.stopPropagation();
            event.preventDefault();

            // Hide message.
                $message._hide();

            // Disable submit.
                $submit.disabled = true;

            // Process form.
            // Note: Doesn't actually do anything yet (other than report back with a "thank you"),
            // but there's enough here to piece together a working AJAX submission call that does.
                window.setTimeout(function() {

                    // Reset form.
                        $form.reset();

                    // Enable submit.
                        $submit.disabled = false;

                    // Show message.
                        $message._show('success', 'Thank you!');
                        //$message._show('failure', 'Something went wrong. Please try again.');

                }, 750);

        });
       
})();