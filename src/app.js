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

    let slidesV = [];
    let slidesH = [];

    slides.sort((a, b) => a[3].length - b[3].length).forEach(slide => {
        if (slide[1] === true) {
            slidesH.push(slide);
        } else {
            slidesV.push(slide);
        }
    });

    let t0 = performance.now();

    let categoriesHIds = categoriesFromSlides(slides);

    console.log('build cats time', performance.now() - t0);


    let t1 = performance.now();

    let timeToRefreshCategories = 500;

    while (true) {


        let nextUnused = getStartSlide(slidesH, slidesV);

        if (!nextUnused) break;

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
            let intersV = [];


            forEachSlidersInSlideCategories(slide, categoriesHIds, slide2 => {

                if (!slide2[7] && !slide2[4]) { // is checked/used?

                    if (slide2[1]) { // is horizontal?

                        let score = calcTransitionCoeff(slide2[2], slide[3], slide2[3]);

                        if (score > maxScore) {
                            maxScore = score;
                            maxInterestSlide = slide2;
                        }

                    } else {

                        let intersect = intersection(slide[3], slide2[3]);

                        if (intersect.total > 2) {
                            intersV.push({
                                slide: slide2,
                                intersectionCount: intersect.total,
                                intersections: intersect.result
                            });
                        }

                    }

                    slide2[7] = true;
                }


            });


            forEachSlidersInSlideCategories(slide, categoriesHIds, slide2 => slide2[7] = false);


            if (intersV.length > 1) {

                //intersV.sort((a, b) => a.intersectionCount - b.intersectionCount);


                let pic1, maxPic1, pic2, maxPic2, moreInterest;

                for (let i = intersV.length - 1; i > 0; i--) {

                    let v1 = intersV[i];
                    pic1 = v1.slide;


                    for (let i2 = i - 1; i2 >= 0; i2--) {

                        let v2 = intersV[i2];
                        pic2 = v2.slide;


                        let commons = arrayUnique(pic1[3].concat(pic2[3]));

                        let indexes = arrayIndexes(pic1[2].map(v => v), pic2[2].map(v => v));

                        let score = calcTransitionCoeff(indexes, slide[3], commons);

                        if (score > maxScore) {
                            maxScore = score;
                            maxInterestSlide = formatSlide([pic1[0], pic2[0]], true,
                                indexes,
                                commons.sort(( a,b ) => a - b)
                            );
                            moreInterest = true;
                            maxPic1 = pic1;
                            maxPic2 = pic2;
                        }

                    }

                }


                if (moreInterest) maxPic1[4] = maxPic2[4] = true;

            }


            if (maxInterestSlide) {

                result.push(maxInterestSlide);

                maxInterestSlide[4] = true;

                timeToRefreshCategories--;

                if (!timeToRefreshCategories) {
                    categoriesHIds = categoriesFromSlides(slides);
                    timeToRefreshCategories = 500;
                }
            }


        }
    }

    console.log("main while", performance.now() - t1);

    showResult(result);
}


function showResult(result) {

    let sum = 0;

    for (let i = 0; i < result.length; i++) {
        let a = result[i];
        let b = result[i + 1];
        if (b) {
            sum += calcTransition(a, b);
        }

    }

    console.log(sum, result.length, sum / result.length);

    download('res', generateResultFromSlides(result));

}


function getVerticalSlide(sls) {
    let v1, v2, intersec = Infinity;

    v1 = sls.find(v => !v[4]);

    if (v1) {
        for (let i = 0; i < sls.length; i++) {
            let tmpV2 = sls[i];

            if (!tmpV2[4] && tmpV2 !== v1) {
                let tmpInter = intersection(tmpV2[3], v1[3]).total;

                if (tmpInter === 0) {

                    v2 = tmpV2;

                    break;
                } else if (tmpInter < intersec) {
                    intersec = tmpInter;
                    v2 = tmpV2;
                }
            }
        }

        let nextUnused = formatSlide([v1[0], v2[0]], true,
            arrayIndexes(v1[2].map(v => v), v2[2].map(v => v)),
            arrayUnique(v1[3].concat(v2[3]))
        );

        v1[4] = v2[4] = true;

        return nextUnused;
    }

}


function forEachSlidersInSlideCategories(slide, categoriesHIds, fn) {
    slide[3].forEach(categoryKey => {

        let categories = categoriesHIds[categoryKey];

        categories && categories.forEach(fn);
    });
}


function getStartSlide(slidesH, slidesV) {
    let hSlide = slidesH.find(v => !v[4] && v[3].length > 1);

    if (hSlide) {
        return hSlide

    } else if (slidesV.length > 1) {

        return getVerticalSlide(slidesV);

    }

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


function calcTransitionCoeff(s2CatsBooleans, s1Cats, s2Cats) {
    let commonCats = 0;


    s1Cats.forEach(v => {
        if (s2CatsBooleans[v]) {
            commonCats++;
        }
    });

    return calcCoeff(s1Cats.length, s2Cats.length, commonCats);
}

function calcCoeff(s1CatsLength, s2CatsLength, commonLength) {
    let min = Math.min(commonLength, s1CatsLength - commonLength, s2CatsLength - commonLength);


    return min / (commonLength + s1CatsLength - commonLength + s2CatsLength - commonLength);
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
                if (parsedV[i + 2] && !totalCategories[parsedV[i + 2]]) {
                    totalCategories[parsedV[i + 2]] = categoriesCount++;
                }
            }

            return v.split(' ');

        })
        .map((parsedV, id) => {
            let categoriesIds = [];
            let categoriesIdsAsKey = [];

            for (let i = 0; i <= parsedV[1]; ++i) {

                if (parsedV[i + 2]) {

                    categoriesIds[totalCategories[parsedV[i + 2]]] = true;
                    categoriesIdsAsKey.push(totalCategories[parsedV[i + 2]]);
                }
            }

            return formatSlide(id - 1, parsedV[0] === 'H', categoriesIds, categoriesIdsAsKey.sort((a, b) => a - b ));
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
    let slsV = sls
        .filter(v => v[1] === false)
        .sort((a, b) => a[3].length - b[3].length);

    let t1 = performance.now();

    for (let i = 0, i2 = slsV.length - 1; i < (slsV.length / 2); i++, i2--) {
        let s = slsV[i];
        let s2 = slsV[i2];

        sls.push(formatSlide([s[0], s2[0]], true, arrayIndexes(s[2], s2[2]), arrayUnique(s[3].concat(s2[3]))));

        //s[5] = s2[5] = true;

    }

    console.log(performance.now() - t1, 'generate H slides');

}


function intersection(a, b) {
    let ai = 0, bi = 0;
    let result = [];
    let total = 0;

    while (ai < a.length && bi < b.length) {
        if (a[ai] < b[bi]) {
            ai++;
        } else if (a[ai] > b[bi]) {
            bi++;
        } else {
            total++;
            result.push(a[ai]);
            ai++;
            bi++;
        }
    }

    return {result, total};
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

function findSame(slides) {

}


function formatSlide(id, type, categoriesIds, categoryKeys, used, united, lazed, checked) {
    return Array.of.apply(null, arguments);
}
