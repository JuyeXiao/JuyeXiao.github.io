

(function() {

	"use strict";

	var	$body = document.querySelector('body');

	// Methods/polyfills.

		// classList | (c) @remy | github.com/remy/polyfills | rem.mit-license.org
			!function(){function t(t){this.el=t;for(var n=t.className.replace(/^\s+|\s+$/g,"").split(/\s+/),i=0;i<n.length;i++)e.call(this,n[i])}function n(t,n,i){Object.defineProperty?Object.defineProperty(t,n,{get:i}):t.__defineGetter__(n,i)}if(!("undefined"==typeof window.Element||"classList"in document.documentElement)){var i=Array.prototype,e=i.push,s=i.splice,o=i.join;t.prototype={add:function(t){this.contains(t)||(e.call(this,t),this.el.className=this.toString())},contains:function(t){return-1!=this.el.className.indexOf(t)},item:function(t){return this[t]||null},remove:function(t){if(this.contains(t)){for(var n=0;n<this.length&&this[n]!=t;n++);s.call(this,n,1),this.el.className=this.toString()}},toString:function(){return o.call(this," ")},toggle:function(t){return this.contains(t)?this.remove(t):this.add(t),this.contains(t)}},window.DOMTokenList=t,n(Element.prototype,"classList",function(){return new t(this)})}}();

		// canUse
			window.canUse=function(p){if(!window._canUse)window._canUse=document.createElement("div");var e=window._canUse.style,up=p.charAt(0).toUpperCase()+p.slice(1);return p in e||"Moz"+up in e||"Webkit"+up in e||"O"+up in e||"ms"+up in e};

		// window.addEventListener
			(function(){if("addEventListener"in window)return;window.addEventListener=function(type,f){window.attachEvent("on"+type,f)}})();

	// Play initial animations on page load.
		window.addEventListener('load', function() {
			window.setTimeout(function() {
				$body.classList.remove('is-preload');
			}, 100);
		});

	// contact
		(function() {

			// Vars.
				var $form = document.querySelectorAll('#contact-form')[0],
                    $name = document.querySelectorAll('#name')[0],
                    $email = document.querySelectorAll('#email')[0],
                    $message = document.querySelectorAll('#message')[0],
                    $submit = document.querySelectorAll('#contact-form input[type="submit"]')[0],
					$messageSuccess;

			// Bail if addEventListener isn't supported.
				if (!('addEventListener' in $form))
					return;

			// Message.
				$messageSuccess = document.createElement('span');
					$messageSuccess.classList.add('messageSuccess');
					$form.appendChild($messageSuccess);

				$messageSuccess._show = function(type, text) {

					$messageSuccess.innerHTML = text;
					$messageSuccess.classList.add(type);
					//$messageSuccess.classList.add('visible');

					window.setTimeout(function() {
						$messageSuccess._hide();
					}, 5000);

				};

				$messageSuccess._hide = function() {
                    //$messageSuccess.classList.add('invisible');
                    $messageSuccess.innerHTML = null;
				};

			// Events.
			// Note: If you're *not* using AJAX, get rid of this event listener.
				$form.addEventListener('submit', function(event) {

					event.stopPropagation();
					event.preventDefault();

					// Hide message.
						$messageSuccess._hide();

					// Disable submit.
						$submit.disabled = true;

					// Process form.
					// Note: Doesn't actually do anything yet (other than report back with a "thank you"),
					// but there's enough here to piece together a working AJAX submission call that does.
                    var formData = $($form).serialize();
                    $.ajax({
                        type: 'POST',
                        url: $($form).attr('action'),
                        data: formData
                    })
                    window.setTimeout(function() {
                            
							// Reset form.
								$form.reset();

							// Enable submit.
								$submit.disabled = false;

							// Show message.
								$messageSuccess._show('success', 'Thank you!');
								//$message._show('failure', 'Something went wrong. Please try again.')
						}, 1000);
                        
				});

		})();

})();
