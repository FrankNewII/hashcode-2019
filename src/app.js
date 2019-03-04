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


function artem(slides) {

    let result = [];

    makeHFromV(slides);
    slides = slides.filter(slide => slide[1] === "H");

    let t0 = performance.now();
    let categoriesIds = categoriesFromSlides(slides);
    console.log('build cats time', performance.now() - t0);
    let t1 = performance.now();

    let timeToRefreshCategories = 500;
    while (true) {
        let nextUnused = slides.find(v => !v[4]);

        if (!nextUnused) {
            break;
        }

        nextUnused[4] = true;

        result.push(nextUnused);

        let slideIdx = result.length - 1;

        while (true) {

            let slide = result[slideIdx++];

            if (!slide) {
                break;
            }

            let maxInterestSlide = null;
            let maxScore = 0;

            slide[3].forEach(categoryKey => {
                let categories = categoriesIds[categoryKey];

                categories && categories.forEach(slide2 => {

                    if (!slide2[4]) {

                        let score = calcTransition(slide, slide2);

                        if (score > maxScore) {
                            maxScore = score;
                            maxInterestSlide = slide2;
                        }

                    }
                });
            });

            if (maxInterestSlide) {
                result.push(maxInterestSlide);

                maxInterestSlide[4] = true;

                timeToRefreshCategories--;

                if (!timeToRefreshCategories) {
                    categoriesIds = categoriesFromSlides(slides);
                    timeToRefreshCategories = 500;
                }
            }

        }

    }

    console.log("main while", performance.now() - t1);

    download('res', generateResultFromSlides(result));
}

function calcTransition(s1, s2) {
    let commonCats = 0;
    let categoriesS1 = s2[2];

    s1[3].forEach(v => {
        if (categoriesS1[v]) {
            commonCats++;
        }
    });

    return Math.min(commonCats, s1[3].length - commonCats, s2[3].length - commonCats);
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
        if (v[0][0] === undefined) {
            return v[0];
        } else {
            return v[0][0] + ' ' + v[0][1];
        }
    });

    return slides.length + '\n' + slides.join('\n');
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
                if (parsedV[i + 2] && totalCategories[parsedV[i + 2]] === undefined) {
                    totalCategories[parsedV[i + 2]] = categoriesCount++;
                }
            }

            return v.split(' ');

        }).map((parsedV, id) => {
            let categoriesIds = [];
            let categoriesIdsAsKey = [];

            for (let i = 0; i <= parsedV[1]; ++i) {

                if (parsedV[i + 2]) {

                    categoriesIds[totalCategories[parsedV[i + 2]]] = true;
                    categoriesIdsAsKey.push(totalCategories[parsedV[i + 2]]);
                }
            }

            return [id - 1, parsedV[0], categoriesIds, categoriesIdsAsKey];
        });

    formattedInput.shift();
    formattedInput.length--;

    return formattedInput;
}


function categoriesFromSlides(slides) {

    let categoriesIds = [];

    slides.forEach(slide => {
        if (!slide[4] && !slide[5] && !slide[6]) {
            slide[3].forEach(val => {
                if (categoriesIds[val]) {
                    categoriesIds[val].push(slide);
                } else {
                    categoriesIds[val] = [slide];
                }
            });
        }
    });

    return categoriesIds;
}

function makeHFromV(sls) {
    let slsV = sls.filter(v => v[1] === 'V').sort((a, b) => a[3].length - b[3].length);

    let t1 = performance.now();

    for (let i = 0, i2 = slsV.length - 1; i < (slsV.length / 2); i++, i2--) {
        let s = slsV[i];
        let s2 = slsV[i2];

        let hSlide = Array(7);
        hSlide[0] = [s[0], s2[0]];
        hSlide[1] = 'H';
        hSlide[2] = arrayIndexes(s[2], s2[2]);
        hSlide[3] = arrayUnique(s[3].concat(s2[3]));

        sls.push(hSlide);

        s[5] = s2[5] = true;

    }

    console.log(performance.now() - t1, 'generate H slides');

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

function arrayIndexes(arr, arr2) {
    arr.forEach((v, idx) => {
        arr2[idx] = true;
    });

    return arr2;
}
