const SIZE_OF_BUTTON_MORE_ON_MOBILE = 125;
const SIZE_OF_BUTTON_MORE_ON_DESKTOP = 80;
const MAX_LIST_ITEM_WIDTH = 225;
const RenderPosition = {
    BEFOREEND: `beforeend`,
    AFTERBEGIN: `afterbegin`,
    BEFORE_ELEMENT: `beforeelemtn`,
};

let documentWidth = document.documentElement.clientWidth; // Получаем ширину окна браузера

let currentSizeOfButtonMore = (documentWidth >= 1200) ? SIZE_OF_BUTTON_MORE_ON_DESKTOP : SIZE_OF_BUTTON_MORE_ON_MOBILE;

/* Функция возвращает общую ширину всех элементов, наибольшую ширину из всех элементов и среднее значение ширины содержащихся в списке елементов*/
// listElements - список элементов, общую ширину которых надо получить
// summaryWidth - общая ширина элементов списка
// maxOfWidths - максимальная ширина элемента в списке
// averageElementWidth - среднее значение ширины элементов 
//
const getSummaryElementsWidth = (listElements) => {
    let summaryElementsWidth = 0;
    let maxWidth = 0;
    listElements.forEach((it) => {
        summaryElementsWidth = summaryElementsWidth + it.offsetWidth;
        maxWidth = (it.offsetWidth > maxWidth) ? it.offsetWidth : maxWidth;
    });

    return {
        summaryWidth: summaryElementsWidth,
        maxOfWidths: maxWidth,
        averageElementWidth: Math.floor(summaryElementsWidth / listElements.length)
        };
}

// Функция переноса элемента в скрытый список
//
const moveElementToHiddenList = (element, indexOfElement) => {
    const indexOfMovieElement = indexOfElement;
    let index = viewMoreItems.length - 1;

    if (index === NaN || index < 0) {
        viewMoreList.prepend(element);
        return;
    }

    while (index >= 0) {
        if (indexOfMovieElement > viewMoreItems[index].getAttribute(`data-index`)) {
            break;
        }
        index = index - 1;

    }

    if (index >= 0) {
        viewMoreItems[index].after(element);
    } else {
        viewMoreItems[0].before(element);
    }
};

/* Функция переноса элементов списка из одного узла в другой*/
// oldParent - откуда переносятся элементы
// place - куда переносятся элементы
// count - номер элемента который надо перенести
//
const replaceElement = (oldParent, place, count, renderPosition) => {
    switch (renderPosition){
        case RenderPosition.BEFOREEND:
            place.append(oldParent[count].cloneNode(true));
            oldParent[count].remove();
            break;
        case RenderPosition.AFTERBEGIN:
            place.prepend(oldParent[count].cloneNode(true));
            oldParent[count].remove();
            break;
        case RenderPosition.BEFORE_ELEMENT:
            place.before(oldParent[count].cloneNode(true));
            oldParent[count].remove();
            break;
        default:
            break;
    }
}

/* Функция задание параметра ширины кнопки для корректного расчета ширины списка при смене верстки на 1200px */
const getDefaultButtonWidth = () => {
    const windowWidth = document.documentElement.offsetWidth; // Получаем значение ширины экрана
    return (windowWidth < 1200) ? SIZE_OF_BUTTON_MORE_ON_MOBILE : SIZE_OF_BUTTON_MORE_ON_DESKTOP;

};

// Функция проверки достаточности места на экране всем элментам меню
//
const changeViewMenuElements = () => {
    if (navMenuMetrix.summaryWidth > navMenuWidth || navMenuFullWidth + buttonLoadMoreWidth > navWidth) {
        // Считаем сколько элементов не умещается
        let count = Math.ceil((navMenuMetrix.summaryWidth + buttonLoadMoreWidth - navMenuWidth) / navMenuMetrix.averageElementWidth);
        
        if (count > menuItems.length - 1) {
            count = menuItems.length - 1;
        }

        if (viewMoreElementButton.classList.contains(`nav__menu-view-more--hidden`)) {
            viewMoreElementButton.classList.remove(`nav__menu-view-more--hidden`);
        }

        while (count > 0) {
            let indexOfMovieElement = menuItems.length - 1
            if (menuItems[menuItems.length - 1].classList.contains(`nav__menu-item--active`)) {
                
                if (indexOfActiveItem === -1) {
                    indexOfActiveItem = menuItems[menuItems.length - 1].getAttribute(`data-index`);
                }
                
                indexOfMovieElement = menuItems.length - 2;
            }

            moveElementToHiddenList(menuItems[indexOfMovieElement], menuItems[indexOfMovieElement].getAttribute(`data-index`));
        
            setActualOffsetParametres();

            count = count - 1;
        }

        setActualOffsetParametres();
        return;
    }
    
    if (viewMoreItems.length === 0) {
        viewMoreElementButton.classList.add(`nav__menu-view-more--hidden`);
    }

    if (navMenuFullWidth + buttonLoadMoreWidth + MAX_LIST_ITEM_WIDTH < navWidth) {
        const defaultIndexOfMovieElement = viewMoreItems[0].getAttribute(`data-index`);

        if (indexOfActiveItem > -1 && defaultIndexOfMovieElement <= indexOfActiveItem) {
            replaceElement(viewMoreItems, menuItems[menuItems.length - 1], 0, RenderPosition.BEFORE_ELEMENT);
        } else {
            replaceElement(viewMoreItems, navMenu, 0, RenderPosition.BEFOREEND);
        }

        setActualOffsetParametres();
        return;
    }
};

// Функция устанавливает параметры ширин меню
//
const setActualOffsetParametres = () => {
    menuItems = navMenu.querySelectorAll(`.nav__menu-item`);
    viewMoreItems = viewMoreList.querySelectorAll(`.nav__menu-item`);

    navWidth = nav.offsetWidth;
    navMenuWidth = navMenu.offsetWidth;
    navMenuFullWidth = navMenu.offsetWidth + navMenu.offsetLeft;
    navMenuMetrix = getSummaryElementsWidth(menuItems);
    currentSizeOfButtonMore = (documentWidth >= 1200) ? SIZE_OF_BUTTON_MORE_ON_DESKTOP : SIZE_OF_BUTTON_MORE_ON_MOBILE;
    setClickHandler(menuItems);
    setClickHandler(viewMoreItems);
};

// Функция обработки события на основном меню
//
const onClickNavMenuItem = (target) => {
    const currentActive = nav.querySelector(`.nav__menu-item--active`);

    if (currentActive !== target) {
        currentActive.classList.remove(`nav__menu-item--active`);
    }

    target.classList.add(`nav__menu-item--active`);
        
    const parentNode = target.parentNode;
    if (parentNode.classList.contains(`nav__view-more-list`)) {
            
        const newActiveIndex = target.getAttribute(`data-index`);
        const indexOfShownElement = menuItems[menuItems.length - 1].getAttribute(`data-index`);
        indexOfActiveItem = newActiveIndex;

        if (indexOfActiveItem <= indexOfShownElement) {
            menuItems[menuItems.length - 1].before(target.cloneNode(true));
            target.remove();
        } else {
            menuItems[menuItems.length - 1].after(target.cloneNode(true));
            target.remove();
        }
            
        setActualOffsetParametres();
            
        let indexOfMovieElement = menuItems.length - 1
        if (menuItems[menuItems.length - 1].classList.contains(`nav__menu-item--active`)) {

            if (indexOfActiveItem === -1) {
                indexOfActiveItem = menuItems[menuItems.length - 1].getAttribute(`data-index`);
            }

            indexOfMovieElement = menuItems.length - 2;
        }

        const defaultIndexOfMovieElement = menuItems[indexOfMovieElement].getAttribute(`data-index`);

        moveElementToHiddenList(menuItems[indexOfMovieElement], defaultIndexOfMovieElement);
        setActualOffsetParametres();
    }
};

// Функция навешивания обработчиков событий на активные элементы списка
//
const setClickHandler = (handlersList) => {
    if (handlersList.length > 0) {
        handlersList.forEach((it) => {
            if (!it.classList.contains(`nav__menu-item--disabled`)) {
                it.removeEventListener(`click`, (evt) => {
                    evt.preventDefault();
                    const target = it;
                    if(!it.classList.contains(`nav__menu-item--active`)) {
                        onClickNavMenuItem(target);
                    }
                });
                it.addEventListener(`click`, (evt) => {
                    evt.preventDefault();
                    const target = it;
                    if(!it.classList.contains(`nav__menu-item--active`)) {
                        onClickNavMenuItem(target);
                    }
                });
            }
        })
    }
};

// Функция открытия меню химических грузов
//
const openFlaskMenu = () => {
    if (popUpFood.classList.contains(`nav__submenu-lv-2-container--active`)) {
        popUpFood.classList.remove(`nav__submenu-lv-2-container--active`);
    }
    popUpFlask.classList.add(`nav__submenu-lv-2-container--active`);
    const rightPosition = document.documentElement.clientWidth - flaskButton.getBoundingClientRect().right;
    popUpFlask.style.right = rightPosition + `px`;
    const flaskAcidMmenu = popUpFlask.querySelector(`.nav__submenu-item-lv-2--acid`);
    
    flaskAcidMmenu.addEventListener(`click`, () => {
        acidMenu.style.display = `block`;
    });
}

//
//
const openFoodMenu = () => {
    if (popUpFlask.classList.contains(`nav__submenu-lv-2-container--active`)) {
        popUpFlask.classList.remove(`nav__submenu-lv-2-container--active`);
        acidMenu.style.display = `none`;
    }

    popUpFood.classList.add(`nav__submenu-lv-2-container--active`);
    const rightPosition = document.documentElement.clientWidth - foodButton.getBoundingClientRect().right;
    popUpFood.style.right = rightPosition + `px`;
};

/*----------------------/ ОСНОВНОЕ ТЕЛО ПРОГРАММЫ /----------------------- */
const nav = document.querySelector(`.nav`);
const navMenu = document.querySelector(`.nav__menu`);
const viewMoreElementButton = document.querySelector(`.nav__menu-view-more`);
const viewMoreList = viewMoreElementButton.querySelector(`.nav__view-more-list`);

const subMenuList = nav.querySelector(`.nav__submenu-list`);

let menuItems = navMenu.querySelectorAll(`.nav__menu-item`);
menuItems.forEach((it, index) => {
    it.setAttribute(`data-index`, index);
});

let viewMoreItems = viewMoreList.querySelectorAll(`.nav__menu-item`);

let droppedElementsCount = 0; // Счетчик количества выпавших элементов

// Получаем ширины контейнера nav, navMenu и полную ширину navMenu с учетом отступа navMenu от левого края
let navWidth = nav.offsetWidth;
let navMenuWidth = navMenu.offsetWidth;
let navMenuFullWidth = navMenu.offsetWidth + navMenu.offsetLeft;
let navMenuMetrix = getSummaryElementsWidth(menuItems);

let indexOfActiveItem = -1; // Устанавливаем индекс активного элемента в списке как отсутствующий

let buttonLoadMoreWidth = getDefaultButtonWidth();


// При первой загрузке страницы проверяем умещается ли navMenu + navMenuLeftMargin в nav
if (navMenuMetrix.summaryWidth > navWidth) {
    changeViewMenuElements();
}

window.addEventListener(`resize`, () => {
    setActualOffsetParametres();
    changeViewMenuElements();
}, false);

setClickHandler(menuItems);

const popUpFood = document.querySelector(`.nav__submenu-lv-2-container--food`);
const popUpFlask = document.querySelector(`.nav__submenu-lv-2-container--flask`);
const acidMenu = popUpFlask.querySelector(`.nav__submenu-list-lv-3--acid`);

//Открытие выпадайки пищевых грузов
//
const foodButton = document.querySelector(`.nav__submenu-item--food`);
foodButton.addEventListener(`click`, openFoodMenu);

// Открытие выпадайки химических грузов
//
const flaskButton = document.querySelector(`.nav__submenu-item--flask`);
flaskButton.addEventListener(`click`, openFlaskMenu);
