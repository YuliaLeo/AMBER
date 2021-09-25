"use strict";

window.onload = function () {

	//=============================PRELOADER
	const loader = document.querySelector('.loader');
	if (loader) {
		loader.classList.add("disappear");
	}
	//=============================

	if (document.querySelector('.wrapper')) {
		document.querySelector('.wrapper').classList.add("_loaded");
	}

	function testWebP(callback) {

	var webP = new Image();
	webP.onload = webP.onerror = function () {
		callback(webP.height == 2);
	};
	webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
}

testWebP(function (support) {

	if (support == true) {
		document.querySelector('body').classList.add('webp');
	} else {
		document.querySelector('body').classList.add('no-webp');
	}
});;
const popupLinks = document.querySelectorAll(".popup-link"); //elegir todos las enlaces para popups
const body = document.querySelector('body');
const lockPadding = document.querySelectorAll('.lock-padding'); //utilizar para objetos son valor absolute y fixed

let unlock = true;

const timeout = 800;  //para detener la animacion, tiene que ser el mismo numero que transition: all 0.8s;

if (popupLinks.length > 0) {
	for (let index = 0; index < popupLinks.length; index++) {
		const popupLink = popupLinks[index];
		popupLink.addEventListener('click', function (e) {
			const popupName = popupLink.getAttribute("href").replace("#", ""); //para qiutar #
			const curentPopup = document.getElementById(popupName);
			popupOpen(curentPopup);
			e.preventDefault();
		});
	}
}

const popupCloseIcon = document.querySelectorAll(".close-popup"); //para cerrar popups
if (popupCloseIcon.length > 0) {
	for (let index = 0; index < popupCloseIcon.length; index++) {
		const el = popupCloseIcon[index];
		el.addEventListener('click', function (e) {
			popupClose(el.closest(".popup"));
			e.preventDefault();
		});
	}
}

function popupOpen(curentPopup) {
	if (curentPopup && unlock) {
		const popupActive = document.querySelector('.popup._open');
		if (popupActive) {
			popupClose(popupActive, false);
		}
		else {
			bodyLock();
		}
		curentPopup.classList.add("_open");
		curentPopup.addEventListener('click', function (e) {
			if (!e.target.closest(".popup__content")) { //permite cerrar popup si haces click en area negra
				popupClose(e.target.closest(".popup"));
			}
		});
	}
}

function popupClose(popupActive, doUnlock = true) {
	if (unlock) {
		popupActive.classList.remove("_open");
		if (doUnlock) {
			bodyUnlock();
		}
	}
}

function bodyLock() {
	const lockPaddingValue = window.innerWidth - document.querySelector(".wrapper").offsetWidth + "px";

	if (lockPadding.length > 0) {
		for (let index = 0; index < lockPadding.length; index++) {
			const el = lockPadding[index];
			el.style.paddingRight = lockPaddingValue;
		}
	}

	body.style.paddingRight = lockPaddingValue;
	body.classList.add("_lock");

	unlock = false;
	setTimeout(function () { //para detener la animacion
		unlock = true;
	}, timeout);
}

function bodyUnlock() {
	setTimeout(function () {
		if (lockPadding.length > 0) {
			for (let index = 0; index < lockPadding.length; index++) {
				const el = lockPadding[index];
				el.style.paddingRight = "0px";
			}
		}
		body.style.paddingRight = "0px";
		body.classList.remove("_lock");
	}, timeout);

	unlock = false;
	setTimeout(function () {
		unlock = true;
	}, timeout);

}

document.addEventListener('keydown', function (e) { //para cerrar con ESCAPE
	if (e.which === 27) {
		const popupActive = document.querySelector(".popup._open");
		popupClose(popupActive);
	}
});

//POLIFILLS PARA EXPLOER (para que closest y matches funcionen)
(function () {

	if (!Element.prototype.closest) {

		Element.prototype.closest = function (css) {
			var node = this;

			while (node) {
				if (node.matches(css)) return node;
				else node = node.parentElement;
			}
			return null;
		};
	}

})();

(function () {

	if (!Element.prototype.matches) {

		Element.prototype.matches = Element.prototype.matchesSelector ||
			Element.prototype.webkitMatchesSelector ||
			Element.prototype.mozMatchesSelector ||
			Element.prototype.msMatchesSelector;

	}

})();
// HTML data-da="where(uniq class name),position(digi),when(breakpoint)"
// e.x. data-da="item,2,992"

"use strict";

(function () {
	let originalPositions = [];
	let daElements = document.querySelectorAll('[data-da]');
	let daElementsArray = [];
	let daMatchMedia = [];

	if (daElements.length > 0) {
		let number = 0;
		for (let index = 0; index < daElements.length; index++) {
			const daElement = daElements[index];
			const daMove = daElement.getAttribute('data-da');
			if (daMove != '') {
				const daArray = daMove.split(',');
				const daPlace = daArray[1] ? daArray[1].trim() : 'last';
				const daBreakpoint = daArray[2] ? daArray[2].trim() : '767';
				const daType = daArray[3] === 'min' ? daArray[3].trim() : 'max';
				const daDestination = document.querySelector('.' + daArray[0].trim())
				if (daArray.length > 0 && daDestination) {
					daElement.setAttribute('data-da-index', number);

					originalPositions[number] = {
						"parent": daElement.parentNode,
						"index": indexInParent(daElement)
					};

					daElementsArray[number] = {
						"element": daElement,
						"destination": document.querySelector('.' + daArray[0].trim()),
						"place": daPlace,
						"breakpoint": daBreakpoint,
						"type": daType
					}
					number++;
				}
			}
		}
		dynamicAdaptSort(daElementsArray);


		for (let index = 0; index < daElementsArray.length; index++) {
			const el = daElementsArray[index];
			const daBreakpoint = el.breakpoint;
			const daType = el.type;

			daMatchMedia.push(window.matchMedia("(" + daType + "-width: " + daBreakpoint + "px)"));
			daMatchMedia[index].addListener(dynamicAdapt);
		}
	}

	function dynamicAdapt(e) {
		for (let index = 0; index < daElementsArray.length; index++) {
			const el = daElementsArray[index];
			const daElement = el.element;
			const daDestination = el.destination;
			const daPlace = el.place;
			const daBreakpoint = el.breakpoint;
			const daClassname = "_dynamic_adapt_" + daBreakpoint;

			if (daMatchMedia[index].matches) {

				if (!daElement.classList.contains(daClassname)) {
					let actualIndex = indexOfElements(daDestination)[daPlace];
					if (daPlace === 'first') {
						actualIndex = indexOfElements(daDestination)[0];
					} else if (daPlace === 'last') {
						actualIndex = indexOfElements(daDestination)[indexOfElements(daDestination).length];
					}
					daDestination.insertBefore(daElement, daDestination.children[actualIndex]);
					daElement.classList.add(daClassname);
				}
			} else {
				if (daElement.classList.contains(daClassname)) {
					dynamicAdaptBack(daElement);
					daElement.classList.remove(daClassname);
				}
			}
		}
	}

	dynamicAdapt();

	function dynamicAdaptBack(el) {
		const daIndex = el.getAttribute('data-da-index');
		const originalPlace = originalPositions[daIndex];
		const parentPlace = originalPlace['parent'];
		const indexPlace = originalPlace['index'];
		const actualIndex = indexOfElements(parentPlace, true)[indexPlace];
		parentPlace.insertBefore(el, parentPlace.children[actualIndex]);
	}
	function indexInParent(el) {
		var children = Array.prototype.slice.call(el.parentNode.children);
		return children.indexOf(el);
	}
	function indexOfElements(parent, back) {
		const children = parent.children;
		const childrenArray = [];
		for (let i = 0; i < children.length; i++) {
			const childrenElement = children[i];
			if (back) {
				childrenArray.push(i);
			} else {
				if (childrenElement.getAttribute('data-da') == null) {
					childrenArray.push(i);
				}
			}
		}
		return childrenArray;
	}
	function dynamicAdaptSort(arr) {
		arr.sort(function (a, b) {
			if (a.breakpoint > b.breakpoint) { return -1 } else { return 1 }
		});
		arr.sort(function (a, b) {
			if (a.place > b.place) { return 1 } else { return -1 }
		});
	}
}());;
//Para los elementos con la misma animacion se puede usar una clase separada, por ejemplo "anim-show"
/*
.anim-show {
	transform: translate(0, 120%);
	opacity: 0;
	transition: all 0.8s ease 0s;
	&._animation {
		transform: translate(0, 0%);
		opacity: 1;
	}
}
._animation {
	.anim-show {
		transform: translate(0, 0%);
		opacity: 1;
	}
}
*/
//!Tambien es mejor hacer animaciones con elementos que estan dentro de los elementos estaticos

//Para hacer muchas manipulaciones con nth-child()
/*
			@for $var from 1 to 7 {
					$delay: $var * 0.2;
					&:nth-child(#{$var}) {
						@if $var == 1 {
							transition: all 0.8s ease 0s;
						} @else {
							transition: all 0.8s ease #{$delay + s};
						}
					}
				}
*/

const animItems = document.querySelectorAll("._anim-item");

if (animItems.length > 0) {

	window.addEventListener('scroll', animOnScroll);

	function animOnScroll(params) {
		for (let index = 0; index < animItems.length; index++) {

			const animItem = animItems[index];
			const animItemHeight = animItem.offsetHeight;
			const animItemOffset = offset(animItem).top;
			const animStart = 4; //para que el objeto aparezca cuando alcamzamos su quarta parte

			let animItemPoint = window.innerHeight - animItemHeight / animStart;

			if (animItemHeight > window.innerHeight) {
				animItemPoint = window.innerHeight - window.innerHeight / animStart;
			}

			if ((pageYOffset > animItemOffset - animItemPoint) && (pageYOffset < (animItemOffset + animItemHeight))) {
				animItem.classList.add("_animation");
			}
			else {
				if (!animItem.classList.contains("_anim-no-hide")) {
					animItem.classList.remove("_animation");
				}
			}
		}
	}

	function offset(el) {
		const rect = el.getBoundingClientRect(),
			scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
			scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
	}

	setTimeout(() => { //Delay al principio
		animOnScroll();
	}, 300);

};
"use strict"

const spoilersArray = document.querySelectorAll('[data-spoilers]'); //consegir la coleccion

if (spoilersArray.length > 0) {

	//Recibimos los spoilers normales
	const spoilersRegular = Array.from(spoilersArray).filter(function (item, index, self) {
		return !item.dataset.spoilers.split(",")[0];
	});

	//Verificamos si los spoilers normales existen
	if (spoilersRegular.length > 0) {
		initSpoilers(spoilersRegular);
	}

	//Recibimos los spoilers con media
	const spoilersMedia = Array.from(spoilersArray).filter(function (item, index, self) {
		return item.dataset.spoilers.split(",")[0];
	});

	//Verificamos si los spoilers con media existen
	if (spoilersMedia.length > 0) {
		const breakpointArray = []; //creamos una matriz de objetos
		spoilersMedia.forEach(item => {
			const params = item.dataset.spoilers; //recibimos una fila con parametros para cada uno de los objetos
			const breakpoint = {}; //creamos un objeto
			const paramsArray = params.split(","); //recibimos una matriz con parametros
			breakpoint.value = paramsArray[0]; //agregamos el valor del breakpoint
			breakpoint.type = paramsArray[1] ? paramsArray[1].trim() : "max"; //agregamos el valor max o min
			breakpoint.item = item; //agregamos el elemento de la matriz
			breakpointArray.push(breakpoint);  //agregamos el objeto a la matriz
		});

		//Recibimos los breakpoints con los valores unicos
		let mediaQueries = breakpointArray.map(function (item) {
			return "(" + item.type + "-width: " + item.value + "px)," + item.value + "," + item.type;
		});

		//Devolvemos solo los elementos unicos
		mediaQueries = mediaQueries.filter(function (item, index, self) {
			return self.indexOf(item) === index;
		});

		//Trabajamos con cada breakpoint
		mediaQueries.forEach(breakpoint => {
			const paramsArray = breakpoint.split(",");
			const mediaBreakpoint = paramsArray[1];
			const mediaType = paramsArray[2];
			const matchMedia = window.matchMedia(paramsArray[0]);

			const spoilersArray = breakpointArray.filter(function (item) {
				if (item.value === mediaBreakpoint && item.type === mediaType) {
					return true;
				}
			});
			matchMedia.addListener(function () {
				initSpoilers(spoilersArray, matchMedia);
			});
			initSpoilers(spoilersArray, matchMedia);
		});
	}

	//initSpoilers()
	function initSpoilers(spoilersArray, matchMedia = false) {
		spoilersArray.forEach(spoilerBlock => {
			spoilerBlock = matchMedia ? spoilerBlock.item : spoilerBlock;
			if (matchMedia.matches || !matchMedia) {
				spoilerBlock.classList.add("_init");
				initSpoilerBody(spoilerBlock);
				spoilerBlock.addEventListener("click", setSpoilerAction);
			}
			else {
				spoilerBlock.classList.remove("_init");
				initSpoilerBody(spoilerBlock, false);
				spoilerBlock.removeEventListener("click", setSpoilerAction);
			}
		});
	}

	//initSpoilerBody()
	function initSpoilerBody(spoilerBlock, hideSpoilerBody = true) {
		const spoilerTitles = spoilerBlock.querySelectorAll('[data-spoiler]');
		if (spoilerTitles.length > 0) {
			spoilerTitles.forEach(spoilerTitle => {
				if (hideSpoilerBody) {
					spoilerTitle.removeAttribute("tabindex");
					if (!spoilerTitle.classList.contains("_active")) {
						spoilerTitle.nextElementSibling.hidden = true;
					}
				}
				else {
					spoilerTitle.setAttribute("tabindex", "-1");
					spoilerTitle.nextElementSibling.hidden = false;
				}
			});
		}
	}

	//setSpoilerAction()
	function setSpoilerAction(e) {
		const el = e.target;
		if (el.hasAttribute("data-spoiler") || el.closest("[data-spoiler]")) {
			const spoilerTitle = el.hasAttribute("data-spoiler") ? el : el.closest("[data-spoiler]");
			const spoilerBlock = spoilerTitle.closest("[data-spoilers]");
			const oneSpoiler = spoilerBlock.hasAttribute("data-one-spoiler") ? true : false;
			if (!spoilerBlock.querySelectorAll("._slide").length) {
				if (oneSpoiler && !spoilerTitle.classList.contains("_active")) {
					hideSpoilerBody(spoilerBlock);
				}
				spoilerTitle.classList.toggle("_active");
				_slideToggle(spoilerTitle.nextElementSibling, 500);
			}
			e.preventDefault();
		}
	}

	//hideSpoilerBody()
	function hideSpoilerBody(spoilerBlock) {
		const spoilerActiveTitle = spoilerBlock.querySelector('[data-spoiler]._active');
		if (spoilerActiveTitle) {
			spoilerActiveTitle.classList.remove("_active");
			_slideUp(spoilerActiveTitle.nextElementSibling, 500);
		}
	}
}

let _slideUp = (target, duration = 500) => {
	if (!target.classList.contains("_slide")) {
		target.classList.add("_slide");
		target.style.transitionProperty = 'height, margin, padding';
		target.style.transitionDuration = duration + 'ms';
		target.style.boxSizing = 'border-box';
		target.style.height = target.offsetHeight + 'px';
		target.offsetHeight;
		target.style.overflow = 'hidden';
		target.style.height = 0;
		target.style.paddingTop = 0;
		target.style.paddingBottom = 0;
		target.style.marginTop = 0;
		target.style.marginBottom = 0;
		window.setTimeout(() => {
			target.hidden = true;
			target.style.removeProperty('height');
			target.style.removeProperty('padding-top');
			target.style.removeProperty('padding-bottom');
			target.style.removeProperty('margin-top');
			target.style.removeProperty('margin-bottom');
			target.style.removeProperty('overflow');
			target.style.removeProperty('transition-duration');
			target.style.removeProperty('transition-property');
			target.classList.remove("_slide");
		}, duration);
	}
}

let _slideDown = (target, duration = 500) => {
	if (!target.classList.contains("_slide")) {
		target.classList.add("_slide");
		if (target.hidden) {
			target.hidden = false;
		}
		let height = target.offsetHeight;
		target.style.overflow = 'hidden';
		target.style.height = 0;
		target.style.paddingTop = 0;
		target.style.paddingBottom = 0;
		target.style.marginTop = 0;
		target.style.marginBottom = 0;
		target.offsetHeight;
		target.style.boxSizing = 'border-box';
		target.style.transitionProperty = "height, margin, padding";
		target.style.transitionDuration = duration + 'ms';
		target.style.height = height + 'px';
		target.style.removeProperty('padding-top');
		target.style.removeProperty('padding-bottom');
		target.style.removeProperty('margin-top');
		target.style.removeProperty('margin-bottom');
		window.setTimeout(() => {
			target.style.removeProperty('height');
			target.style.removeProperty('overflow');
			target.style.removeProperty('transition-duration');
			target.style.removeProperty('transition-property');
			target.classList.remove("_slide");
		}, duration);
	}
}

let _slideToggle = (target, duration = 500) => {
	if (target.hidden) {
		return _slideDown(target, duration);
	} else {
		return _slideUp(target, duration);
	}
};
if (document.getElementById("comment-form")) {

	const form = document.getElementById("comment-form");
	form.addEventListener("submit", formSend);

	async function formSend(e) {
		e.preventDefault();

		let error = formValidate(form);

		if (error === 0) {

			if (document.getElementById('popup-sent')) {
				popupOpen(document.getElementById('popup-sent'));
			}

			form.reset();
			
			/*
			let response = await fetch("sendmail.php", {
				method: "POST",
				body: formData
			});

			if (response.ok) {
				let result = await response.json();
				alert(result.message);
				formPreview.innerHTML = "";
				form.reset();

				form.classList.remove("_sending");
			} else {
				alert("ERROR");

				form.classList.remove("_sending");
			}
			*/
		}
	}

	function formValidate(form) {
		let error = 0;
		let formReq = document.querySelectorAll('._req');

		for (let index = 0; index < formReq.length; index++) {
			const input = formReq[index];
			formRemoveError(input);
			if (input.classList.contains("_email")) {
				if (emailTest(input)) {
					formAddError(input);
					error++;
				}
			}
			else {
				if (input.value === "") {
					formAddError(input);
					error++;
				}
			}
		}

		return error;
	}

	function formAddError(input) {
		input.parentElement.classList.add("_error");
		input.classList.add("_error");
	}

	function formRemoveError(input) {
		input.parentElement.classList.remove("_error");
		input.classList.remove("_error");
	}

	function emailTest(input) {
		return !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/.test(input.value);
	}
}
;
;

	//=============================ON_CLICK
	document.addEventListener("click", documentActions);
	function documentActions(e) {
		const targetElement = e.target;

		//LOAD_MORE_POSTS
		if (targetElement.classList.contains("masonry-posts__more")) {
			getProducts(targetElement);
			e.preventDefault();
		}

		//LOAD_MORE_GALLERY_ITEMS
		if (targetElement.classList.contains("portfolio-gallery__more")) {
			getGallery(targetElement);
			e.preventDefault();
		}

		//CART_ADD
		if ((targetElement.classList.contains("portfolio-item__btn")) || targetElement.closest(".portfolio-item__btn")) {
			e.preventDefault();
			const productId = targetElement.closest(".page__container").querySelector(".portfolio-slider__fake").dataset.pid;
			addToCart(targetElement.closest(".portfolio-item__btn"), productId);
		}

		//CART_OPEN
		if (document.querySelector(".cart")) {
			if (targetElement.classList.contains("cart__item") || targetElement.closest(".cart__item")) {
				if (document.querySelector(".cart-list").children.length > 0) {
					document.querySelector(".cart").classList.toggle("_active");
				}
				e.preventDefault();
			} else if (!targetElement.closest(".cart__body") && !targetElement.closest(".portfolio-item__btn")) {
				document.querySelector(".cart").classList.remove("_active");
			}
		}

		//CART_DELETE
		if (targetElement.classList.contains("cart-list__delete")) {
			const productId = targetElement.closest(".cart-list__item").dataset.cartPid;
			updateCart(targetElement, productId, false);
			e.preventDefault();
		}

		//LOAD_MORE_PORTFOLIO_ITEMS
		if (targetElement.classList.contains("portfolio-gallery__load")) {
			getPortfolio(targetElement);
			e.preventDefault();
		}
	}
	//=============================

	//=============================BURGER
	const headerBurger = document.querySelector('.header');
	const iconMenu = document.querySelector('.icon-menu');
	const menuBody = document.querySelector('.menu__body');
	if (iconMenu) {
		iconMenu.addEventListener('click', function (e) {
			document.body.classList.toggle("_lock");
			iconMenu.classList.toggle("_active");
			menuBody.classList.toggle("_active");
			headerBurger.classList.toggle("_burger");
		});
	}
	//=============================

	//=============================IBG
	function ibg() {
		let ibgs = document.querySelectorAll('.ibg');
		if (ibgs.length > 0) {
			for (let index = 0; index < ibgs.length; index++) {
				const ibg = ibgs[index];
				if (ibg.querySelector("img")) {
					ibg.style.backgroundImage = 'url("' + ibg.querySelector('img').src + '")';
				}
			}
		}
	}
	ibg();
	//=============================

	//=============================FULLSCREEN_SLIDER
	if (document.querySelector('.fullscreen-slider__slider')) {
		new Swiper(".fullscreen-slider__slider", {

			pagination: {
				el: ".fullscreen-slider-pagination",
				clickable: true
			},

			touchRatio: 1.5,

			grabCursor: true,

			keyboard: {
				enabled: true,

				onlyInViewport: true,
			},

			speed: 1300,

			autoplay: {
				delay: 3000,

				disableOnInteraction: true
			},

			parallax: true,

		});
	}
	//=============================

	//=============================WORKS_SLIDER
	const worksSliderBlock = document.querySelector('.slider-works');

	if (worksSliderBlock) {
		let worksSlider = new Swiper(".slider-works", {
			navigation: {
				nextEl: ".slider-works-button-next",
				prevEl: ".slider-works-button-prev"
			},

			spaceBetween: 30,

			breakpoints: {
				320: {
					slidesPerView: 1,
				},
				480: {
					slidesPerView: 2,
				},
				992: {
					slidesPerView: 3,
				}
			},

			loop: true,

			autoplay: {
				delay: 1500,

				stopOnLastSlide: false,

				disableOnInteraction: true
			},

			speed: 1000,

		});
		worksSliderBlock.addEventListener('mouseenter', function (e) {
			worksSlider.params.autoplay.disableOnInteraction = true;
			worksSlider.params.autoplay.delay = 500;
			worksSlider.autoplay.stop();
		});
		worksSliderBlock.addEventListener('mouseleave', function (e) {
			worksSlider.autoplay.start();
		});
	}
	//=============================

	//=============================INSERT_SPANS
	let bottomWorksText = document.querySelector('.bottom-works__text');

	if (bottomWorksText) {
		bottomWorksText = bottomWorksText.innerHTML.split("");
		let newBottomWorksText = "";

		for (let index = 0; index < bottomWorksText.length; index++) {
			newBottomWorksText += "<span>" + bottomWorksText[index] + "</span>";
		}
		document.querySelector('.bottom-works__text').innerHTML = newBottomWorksText;
	}
	//=============================

	//=============================QOUTES_SLIDER
	if (document.querySelector('.quutes-slider')) {
		new Swiper(".quutes-slider", {
			pagination: {
				el: ".quutes-slider-pagination",
				clickable: true,
			},

			autoHeight: true,

			speed: 1000,

			touchRatio: 1.5,

			grabCursor: true,

			loop: true,
		});
	}
	//=============================

	//=============================SCROLL_TO_TOP
	function smoothScroll(section, duration) {
		let target = document.querySelector(section);
		let targetPosition = target.getBoundingClientRect().top;
		let startPosition = window.pageYOffset;
		let distance = targetPosition - startPosition;
		let startTime = null;

		function animation(currentTime) {
			if (startTime === null) {
				startTime = currentTime;
			}
			let timeElapsed = currentTime - startTime;
			let run = ease(timeElapsed, startPosition, distance, duration);
			window.scrollTo(0, run);
			if (timeElapsed < duration) {
				requestAnimationFrame(animation);
			}
		}

		function ease(t, b, c, d) {
			t /= d / 2;
			if (t < 1) return c / 2 * t * t + b;
			t--;
			return -c / 2 * (t * (t - 2) - 1) + b;
		}

		requestAnimationFrame(animation);
	}

	let goUp = document.querySelector(".bottom-footer__btn");
	if (goUp) {
		goUp.addEventListener('click', function (e) {
			let goUpSection = goUp.getAttribute("href").replace("#", "");
			smoothScroll(goUpSection, 2000);
			e.preventDefault();
		});
	}
	//=============================

	//=============================MASORNY_LAYOUT
	const grids = document.querySelectorAll('.grid-masonry');

	if (grids.length > 0) {
		for (let index = 0; index < grids.length; index++) {
			let grid = grids[index];
			resizeAllGridItems(grid);
			window.addEventListener("resize", () => resizeAllGridItems(grid));
		}
	}

	function resizeAllGridItems(grid) {
		let allGridItems = grid.querySelectorAll(".grid-masonry__item");
		if (allGridItems.length > 0) {
			for (let index = 0; index < allGridItems.length; index++) {
				resizeGridItem(allGridItems[index], grid);
			}
		}
	}

	function resizeGridItem(item, grid) {
		item.querySelector('.grid-masonry__content').style.minHeight = "auto";
		let rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-row-gap'));
		let rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
		let rowSpan = Math.ceil((item.querySelector('.grid-masonry__content').offsetHeight + rowGap) / (rowHeight + rowGap));
		item.querySelector('.grid-masonry__content').style.minHeight = "100%";
		item.style.gridRowEnd = "span " + rowSpan;
	}
	//=============================

	//========================LOAD_WORKS
	async function getProducts(button) {
		if (!button.classList.contains("_hold")) {
			button.classList.add("_hold");
			const file = "json/products.json";
			let response = await fetch(file, {
				method: "GET"
			});
			if (response.ok) {
				let result = await response.json();
				loadProducts(result, button);
				button.classList.remove("_hold");
				button.remove();
			} else {
				alert("ERROR!");
			}
		}
	}

	function loadProducts(data, button) {
		const productsItems = button.previousElementSibling;

		for (let index = 0; index < data.products.length; index++) {

			const item = data.products[index];
			const productUrl = item.url;
			const productImage = item.image;
			const productTitle = item.title;
			const productText = item.text;
			const productComment = item.comment;
			const productDate = item.date;
			const productType = item.type

			let productTemplateStart = `
			<article class="masonry-posts__item masonry-post grid-masonry__item">
			<div class="masonry-post__content grid-masonry__content">`;
			let productTemplateEnd = `
			</div>
			</article>`;

			let productTemplateImage = "";
			if (productImage != "") {
				productTemplateImage = `
				<div class="masonry-post__image masonry-post__image_${productType} ibg">
				<a href="${productUrl}"> <img src="img/posts/${productImage}" alt=""></a>
				<a href="${productUrl}" class="masonry-post__hover">
					<span class="_icon-link"></span>
				</a>
				</div>
				`;
			}

			let productTemplateBody = `
			<div class="masonry-post__block">
			<div class="masonry-post__top">
				<a href="${productUrl}" class="masonry-post__title">
				${productTitle}
				</a>
				<div class="masonry-post__text">
				${productText}
				</div>
			</div>
			<div class="masonry-post__bottom">
				<div class="masonry-post__date _icon-clock">
					<span>${productDate}</span>
				</div>
				<div class="masonry-post__comments _icon-comment">
					<span>${productComment}</span>
				</div>
			</div>
			</div>
			`;

			let productTemplate = ``;
			productTemplate += productTemplateStart;
			productTemplate += productTemplateImage;
			productTemplate += productTemplateBody;
			productTemplate += productTemplateEnd;

			productsItems.insertAdjacentHTML("beforeend", productTemplate);
		}

		ibg();
		resizeAllGridItems(productsItems);
	}
	//========================

	//========================LATESR_SLIDER
	if (document.querySelector('.latest-slider')) {
		new Swiper(".latest-slider", {

			navigation: {
				nextEl: ".latest-slider-button-next",
				prevEl: ".latest-slider-button-prev"
			},

			speed: 1000,

			loop: true,

			autoplay: {
				delay: 1500,

				stopOnLastSlide: false,

				disableOnInteraction: true
			},

		});
	}
	//========================

	//========================TABS
	if (document.querySelector('.tabs')) {
		let tabsItems = document.querySelectorAll('.tabs__item');
		let tabsBlocks = document.querySelectorAll('.tabs__block');

		if (tabsItems.length === tabsBlocks.length) {
			for (let index = 0; index < tabsItems.length; index++) {
				const tabsItem = tabsItems[index];
				const tabsBlock = tabsBlocks[index];
				tabsItem.addEventListener('click', function (e) {
					for (let index_2 = 0; index_2 < tabsItems.length; index_2++) {
						if (tabsItems[index_2].classList.contains("active") && (tabsBlocks[index_2].classList.contains("active"))) {
							tabsItems[index_2].classList.remove("active");
							tabsBlocks[index_2].classList.remove("active");
						}
					}
					this.classList.toggle("active");
					tabsBlock.classList.toggle("active");
					if (tabsBlock.querySelector(".grid-masonry")) {
						resizeAllGridItems(tabsBlock.querySelector(".grid-masonry"));
					}
				});
			}
		}
	}
	//========================

	//========================TABS_SETTINGS
	const tabGrids = document.querySelectorAll('.grid-reconstruct');

	if (tabGrids.length > 0) {
		for (let index = 0; index < tabGrids.length; index++) {
			const tabGrid = tabGrids[index];
			const tabGridElments = tabGrid.querySelectorAll(".grid-reconstruct__item");

			if (tabGrid.classList.contains("portfolio-gallery__images_withoutjs")) {
				if (tabGridElments.length < 3) {
					tabGrid.classList.add("less");
				}
			}
			else {
				if (tabGridElments.length < 4) {
					tabGrid.classList.add("less");
				}
			}
		}
	}
	//========================

	//========================LOAD__GALLERY
	async function getGallery(button) {
		if (!button.classList.contains("_hold")) {
			button.classList.add("_hold");
			const file = "json/gallery.json";
			let response = await fetch(file, {
				method: "GET"
			});
			if (response.ok) {
				let result = await response.json();
				loadGallery(result, button);
				button.classList.remove("_hold");
				button.remove();
			} else {
				alert("ERROR!");
			}
		}
	}

	function loadGallery(data, button) {
		const productsItems = button.previousElementSibling;

		for (let index = 0; index < data.galleryItems.length; index++) {

			const item = data.galleryItems[index];
			const productCategory = item.category;

			if (productsItems.classList.contains("all") || (productsItems.classList.contains(`${productCategory}`))) {
				const productUrl = item.url;
				const productImage = item.image;
				const productSize = item.size;
				const productType = item.type;

				let productTemplateStart = `
			<article class="grid-masonry__item grid-reconstruct__item">
			<div class="masorny-image ibg masorny-image_${productSize} grid-masonry__content">
			`;
				let productTemplateEnd = `
			</div>
			</article>`;

				let productTemplateImage = ``;

				if (productType === "first") {
					productTemplateImage = `
				<a href="${productUrl}"> <img src="img/posts/${productImage}" alt=""></a>
				<div class="masorny-image__hover masorny-image__hover_plus">
					<a href="${productUrl}" class="masorny-image__link masorny-image__link_circle">
						<span class="_icon-plus"></span>
					</a>
				</div>
				`;
				}
				else if (productType === "second") {
					productTemplateImage = `
				<a href="${productUrl}"> <img src="img/posts/${productImage}" alt=""></a>
				<div class="masorny-image__hover masorny-image__hover_down">
				<a href="${productUrl}" class="masorny-image__link masorny-image__link_circle">
					<span class=" _icon-save"></span>
				</a>
				<a href="${productUrl}" class="masorny-image__link">
					<span>Lindemans Wine
					</span>
					<span>Art Direction, Web Design</span>
				</a>
				</div>
				`;
				}
				else {
					productTemplateImage = `
				<a href="${productUrl}"> <img src="img/posts/${productImage}" alt=""></a>
				<div class="masorny-image__hover masorny-image__hover_view">
					<a href="${productUrl}" class="masorny-image__link masorny-image__link_circle">
						<span class=" _icon-video"></span>
					</a>
					<a href="${productUrl}" class="masorny-image__link masorny-image__link_circle">
						<span class=" _icon-link"></span>
					</a>
				</div>
				`;
				}

				let productTemplate = ``;
				productTemplate += productTemplateStart;
				productTemplate += productTemplateImage;
				productTemplate += productTemplateEnd;

				productsItems.insertAdjacentHTML("beforeend", productTemplate);
			}
		}

		if (productsItems.classList.contains("less") && productsItems.querySelectorAll(".grid-reconstruct__item").length >= 4) {
			productsItems.classList.remove("less");
		}

		ibg();
		resizeAllGridItems(productsItems);
	}
	//========================

	//========================PORTFOLIO_SLIDER
	if (document.querySelector(".portfolio-slider")) {
		const portfolioSlider = new Swiper(".portfolio-slider", {
			navigation: {
				nextEl: ".portfolio-slider-button-next",
				prevEl: ".portfolio-slider-button-prev"
			},

			speed: 1000,

			autoplay: {
				delay: 2000,

				stopOnLastSlide: false,

				disableOnInteraction: true
			},

		});

		const swiperPrev = document.getElementById('swiperPrev');
		const swiperNext = document.getElementById('swiperNext');

		if (swiperPrev && swiperNext) {
			swiperPrev.addEventListener('click', () => {
				portfolioSlider.slidePrev();
			});
			swiperNext.addEventListener('click', () => {
				portfolioSlider.slideNext();
			});

			let sliderArrowprev = document.querySelector('.portfolio-slider-button-prev');
			let sliderArrownext = document.querySelector('.portfolio-slider-button-next');

			if (sliderArrowprev && sliderArrownext) {
				portfolioSlider.on("slideChange", function () {
					if (sliderArrowprev.classList.contains('swiper-button-disabled')) {
						swiperPrev.classList.add("disabled");
					}
					else {
						swiperPrev.classList.remove("disabled");
					}
					if (sliderArrownext.classList.contains('swiper-button-disabled')) {
						swiperNext.classList.add("disabled");
					}
					else {
						swiperNext.classList.remove("disabled");
					}
				});
			}
		}
	}
	//========================

	//========================CART
	function addToCart(productButton, productId) {
		if (!productButton.classList.contains("_hold")) {
			productButton.classList.add("_hold");
			productButton.classList.add("_fly");

			const cart = document.querySelector('.cart');
			const product = document.querySelector(`[data-pid="${productId}"`);
			const productImage = product.querySelector('img');

			const productImageFly = productImage.cloneNode(true);

			const productImageFlyWidth = product.offsetWidth;
			const productImageFlyHeight = product.offsetHeight;
			const productImageFlyTop = product.getBoundingClientRect().top;
			const productImageFlyLeft = product.getBoundingClientRect().left;
			const productImageFlyImage = productImage.src;

			productImageFly.setAttribute("class", "_flyImage ibg");
			productImageFly.style.cssText = `
				left: ${productImageFlyLeft}px;
				top: ${productImageFlyTop}px;
				width: ${productImageFlyWidth}px;
				height: ${productImageFlyHeight}px;
				background-image: url("${productImageFlyImage}");
				`;

			document.body.append(productImageFly);

			const cartFlyLeft = cart.getBoundingClientRect().left;
			const cartFlyTop = cart.getBoundingClientRect().top;

			productImageFly.style.cssText = `
				left: ${cartFlyLeft}px;
				top: ${cartFlyTop}px;
				width: 0px;
				height: 0px;
				background-image: url("${productImageFlyImage}");
				opacity: 0;
				`;

			productImageFly.addEventListener("transitionend", function () {
				if (productButton.classList.contains("_fly")) {
					productImageFly.remove();
					updateCart(productButton, productId);
					productButton.classList.remove("_fly");
				}
			});
		}
	}
	function updateCart(productButton, productId, productAdd = true) {
		const cart = document.querySelector('.cart');
		const cartText = cart.querySelector('.cart__text');
		const cartQuantity = cartText.querySelector('span');
		const cartProduct = document.querySelector(`[data-cart-pid="${productId}"`);
		const cartList = cart.querySelector('.cart-list');

		if (productAdd) {
			if (cartQuantity && (cartQuantity.innerHTML !== "0")) {
				cartQuantity.innerHTML = ++cartQuantity.innerHTML;
				cartText.innerHTML = `
				<span>${cartQuantity.innerHTML}</span>
				Items in Cart
				`;
			}
			else {
				cartText.innerHTML = `
				<span>1</span>
				Item in Cart
				`;
			}

			if (!cartProduct) {
				const product = document.querySelector(`[data-pid="${productId}"`);
				const cartProductImage = product.querySelector('img').src;
				const cartProductTitle = document.querySelector('.blog-grid__title').innerHTML;
				const cartProductContent = `
						<a href="" class="cart-list__image ibg" style="background-image: url('${cartProductImage}');"></a>
						<div class="cart-list__body">
							<div class="cart-list__title">${cartProductTitle}</div>
							<div class="cart-list__quantity">Quantity: <span>1</span></div>
							<a href="" class="cart-list__delete">Delete</a>
						</div>
						`;
				cartList.insertAdjacentHTML("beforeend", `<li data-cart-pid='${productId}' class='cart-list__item'>${cartProductContent}</li>`);
			}
			else {
				const cartProductQuantity = cartProduct.querySelector(".cart-list__quantity span");
				cartProductQuantity.innerHTML = ++cartProductQuantity.innerHTML;
			}
			productButton.classList.remove("_hold");
		}
		else {
			const cartProductQuantity = cartProduct.querySelector(".cart-list__quantity span");
			cartProductQuantity.innerHTML = --cartProductQuantity.innerHTML;
			if (!parseInt(cartProductQuantity.innerHTML)) {
				cartProduct.remove();
			}

			const cartQuantityValue = --cartQuantity.innerHTML;

			if (cartQuantityValue) {
				cartQuantity.innerHTML = cartQuantityValue;
				if (cartQuantity.innerHTML === "1") {
					cartText.innerHTML = `
					<span>1</span>
					Item in Cart
					`;
				}
			}
			else {
				cartText.innerHTML = `
					Items in Cart
					`;
				cart.classList.remove("_active");
			}
		}
	}
	//========================

	//========================LOAD_PORTFOLIO
	async function getPortfolio(button) {
		if (!button.classList.contains("_hold")) {
			button.classList.add("_hold");
			const file = "json/portfolio.json";
			let response = await fetch(file, {
				method: "GET"
			});
			if (response.ok) {
				let result = await response.json();
				loadPortfolio(result, button);
				button.classList.remove("_hold");
				button.remove();
			} else {
				alert("ERROR!");
			}
		}
	}

	function loadPortfolio(data, button) {
		const productsItems = button.previousElementSibling;

		for (let index = 0; index < data.products.length; index++) {

			const item = data.products[index];
			const productCategory = item.category;

			if (productsItems.classList.contains("all") || (productsItems.classList.contains(`${productCategory}`))) {

				const productUrl = item.url;
				const productImage = item.image;
				const productTitle = item.title;
				const productText = item.text;
				const productComments = item.comments;

				let productTemplateStart = `
			<article class="portfolio-gallery__item item-work grid-reconstruct__item">
			`;
				let productTemplateEnd = `
			</article>
			`;

				let productTemplateImage = `
			<a href="${productUrl}" class="item-work__image ibg">
			<img src="img/works/${productImage}" alt="">
			</a>
			`;

				let productTemplateBody = `
			<div class="item-work__text">
				<a href="${productUrl}" class="item-work__title"><span>${productTitle}</span>
					<span class="_icon-heart"></span>
				</a>
				<div class="item-work__descr"><span>${productText}</span>
					<span>${productComments}</span>
				</div>
			</div>
			`;

				let productHover = `
			<div class="item-work__hover hover-item-work">
				<a href="${productUrl}" class="hover-item-work__action">
					<span class=" _icon-heart"></span>
				</a>
				<a href="${productUrl}" class="hover-item-work__action ">
					<span class="_icon-search1"></span>
				</a>
				<a href="${productUrl}" class="hover-item-work__action ">
					<span class="_icon-link"></span>
				</a>
			</div>
			`;

				let productTemplate = ``;
				productTemplate += productTemplateStart;
				productTemplate += productTemplateImage;
				productTemplate += productTemplateBody;
				productTemplate += productHover;
				productTemplate += productTemplateEnd;

				productsItems.insertAdjacentHTML("beforeend", productTemplate);
			}
		}

		if (productsItems.classList.contains("less") && productsItems.querySelectorAll(".grid-reconstruct__item").length >= 3) {
			productsItems.classList.remove("less");
		}

		ibg();
	}
	//========================
}


