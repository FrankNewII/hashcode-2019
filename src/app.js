function onChange(e) {

    let input = event.target;
    let reader = new FileReader();

    reader.onload = function () {

        let slides = getArraysFromText(reader.result);

        //let categories = categoriesFromSlides(slides);

        artem(slides);
    };

    reader.readAsText(input.files[0]);
}

window.onChange = onChange;


function artem(slides, categoriesH) {

    let result = [];

    makeHFromV(slides);
    slides = slides.filter(slide => slide.type === "H");

    categoriesH = categoriesFromSlides(slides).categoriesH;


    let t1 = performance.now();

    while (true) {
        let nextUnused = slides.find(v => !v.used);

        if (!nextUnused) {
            break;
        }
        nextUnused.used = true;
        result.push(nextUnused);
        let k = 40000;
        let slideIdx = result.length - 1;

        while (k--) {

            let slide = result[slideIdx++];

            if (!slide) {
                break;
            }

            let maxInterestSlide = null;
            let maxScore = 0;

            slide.categoriesKeys.forEach(categoryKey => {

                if (!categoriesH[categoryKey].used) {
                    let availableSlides = false;
                    categoriesH[categoryKey].slides.forEach(slide2 => {

                        if (!slide2.used) {

                            availableSlides = true;

                            let score = calcTransition(slide, slide2);

                            if (score > maxScore) {
                                maxScore = score;
                                maxInterestSlide = slide2;
                            }

                        }
                    });

                    if (!availableSlides) categoriesH[categoryKey].used = true;
                }
            });

            if (!maxInterestSlide) {
                k++;
            } else {
                result.push(maxInterestSlide);

                maxInterestSlide.used = true;
            }

        }

    }

    console.log("main while", performance.now() - t1);

    download('res', generateResultFromSlides(result));
}


function calcTransition(s1, s2) {
    let commonCats = 0, s1Cats = 0, s2Cats = 0;

    s1.categoriesKeys.forEach(v => {
        let idx = s2.categoriesKeys.indexOf(v);
        if (idx === -1) {
            s1Cats++;
        } else {
            commonCats++;
        }
    });

    s2.categoriesKeys.forEach(v => {
        let idx = s1.categoriesKeys.indexOf(v);
        if (idx === -1) {
            s2Cats++;
        }
    });

    return Math.min(commonCats, s2Cats, s1Cats);
}

function getPicsFromCat(category, categories) {
    let semiRes = [];
    let lastAddedPic;
    let addedSlides = 0;

    categories[category].forEach(slide => {
        if (!slide.used) {
            addedSlides++;
            semiRes.push(slide);
            slide.used = true;

            lastAddedPic = slide;
        }
    });

    return {semiRes, lastAddedPic, addedSlides}
}


function generateResultFromSlides(slides) {
    slides = slides.map(v => {
        if (v.id[0] === undefined) {
            return v.id;
        } else {
            return v.id[0] + ' ' + v.id[1];
        }
    });

    return slides.length + '\n' + slides.join('\n');
}


function recursiveGetPics(startedPic, categories) {
    let semiResult = [];

    startedPic.categories.forEach(category => {
        categories[category].forEach(pic => {
            if (!pic.used) {
                semiResult.push(pic);
                pic.used = true;
                recursiveGetPics(pic);
            }
        })
    });

    return {semiResult};
}


function download(filename, text) {
    let element = document.createElement('a');

    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}


function getArraysFromText(text) {
    let totalCategories = {};
    let categoriesCount = 0;

    let formattedInput = text.split(/\n/)
        .map(v => {
            let parsedV = v.split(' ');

            for (let i = 0; i <= parsedV[1]; ++i) {
                if (parsedV[i + 2]) {
                    totalCategories[parsedV[i + 2]] = categoriesCount++;
                }
            }

            return v.split(' ');

        }).map((parsedV, id) => {
            let categories = {};
            let categoriesSize = 0;
            let categoriesKeys = [];
            let categoriesIds = [];

            for (let i = 0; i <= parsedV[1]; ++i) {

                if (parsedV[i + 2]) {
                    categories[parsedV[i + 2]] = 1;
                    categoriesKeys.push(parsedV[i + 2]);
                    categoriesSize++;

                    categoriesIds[totalCategories[parsedV[i + 2]]] = true;
                }
            }

            categoriesKeys.sort();
            return {
                id: id - 1,
                used: false,
                categoriesSize,
                united: false,
                categoriesIds,
                type: parsedV[0],
                categoriesKeys,
                categories
            };
        });

    formattedInput.shift();
    formattedInput.length--;

    return formattedInput;
}


function categoriesFromSlides(slides) {
    let categoriesH = {
        keys: []
    };

    let categoryIds = {
        keys: []
    };

    slides.forEach(slide => slide.categoriesKeys.forEach(val => {
        if (slide.type === "H") {
            if (categoriesH[val]) {
                categoriesH[val].slides.push(slide);
            } else {
                categoriesH[val] = {};
                categoriesH.keys.push(val);
                categoriesH[val].used = false;
                categoriesH[val].slides = [slide];
            }
        }
    }));

    return {categoriesH, categoryIds}
}

function makeHFromV(slides) {
    let slidesV = slides.filter(v => v.type === 'V');

    let slide;

    while (true) {
        slide = slidesV.find(v => !v.united);

        if (!slide) break;

        let intersectionCount = Infinity;
        let minIntersecSlide = null;

        for (let i = 0; i < slidesV.length; i++) {
            let slide2 = slidesV[i];

            if (!slide2.united && slide2 !== slide) {
                let newIntersection = intersection(slide, slide2);

                if (newIntersection === 0) {
                    minIntersecSlide = slide2;
                    break;
                } else if (newIntersection < intersectionCount) {
                    minIntersecSlide = slide2;
                    intersectionCount = newIntersection;
                }
            }
        }

        slides.push({
            id: [slide.id, minIntersecSlide.id],
            categoriesKeys: arrayUnique(slide.categoriesKeys.concat(minIntersecSlide.categoriesKeys)),
            type: 'H'
        });

        slide.united = minIntersecSlide.united = true;
    }

}


function intersection(a, b) {
    let ai = 0, bi = 0;
    let result = 0;

    while (ai < a.length && bi < b.length) {
        if (a[ai] < b[bi]) {
            ai++;
        } else if (a[ai] > b[bi]) {
            bi++;
        } else /* they're equal */
        {
            result++;
            ai++;
            bi++;
        }
    }

    return result;
}

function arrayUnique(array) {
    let a = array.concat();
    for (let i = 0; i < a.length; ++i) {
        for (let j = i + 1; j < a.length; ++j) {
            if (a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
}
