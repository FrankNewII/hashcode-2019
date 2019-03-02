function onChange(e) {

    let input = event.target;
    let reader = new FileReader();

    reader.onload = function () {

        let slides = getArraysFromText(reader.result);

        let categories = categoriesFromSlides(slides);

        artem(slides, categories.categoriesH, categories.categoriesV);
    };

    reader.readAsText(input.files[0]);
}

window.onChange = onChange;
















function artem(slides, categoriesH, categoriesV) {

    let result = [];

    slides.sort(function (a, b) {
       return a.categoriesSize - b.categoriesSize;
    }).splice(Math.floor(slides.length / 2), Math.floor(slides.length / 3) * 2);

    let k = 53332;
    let t1 = performance.now();
    let slideIdx = 0;
    let slidesLength = slides.length;

    while(k--) {

        let slide = slides[slideIdx++];

        if (!slide) {
            break;
        }

        if (slide.used) {
            k++;
            continue;
        }



        let maxInterestSlide = null;
        let maxScore = 0;

        for (let id = slideIdx; id < slides.length; id++) {

            let slide2 = slides[id];

            if (!slide2.used) {

                let score = calcTransition(slide, slide2);

                if (score > maxScore) {
                    maxScore = score;
                    maxInterestSlide = id;
                }

            }

        }

        if (!maxInterestSlide) {
            k++;
            continue;
        }

        result.push(slide, slides[maxInterestSlide]);

        slides[maxInterestSlide].used = true;

        //slides.splice(maxInterestSlide, 1);


    }

    console.log("main while",performance.now() - t1);

    download('res', generateResultFromSlides(result));
}
































function calcTransition(s1, s2) {
    let commonCats = 0, s1Cats = 0, s2Cats = 0;

    s1.categoriesKeys.forEach( v => {
        let idx = s2.categoriesKeys.indexOf(v);
       if (idx === -1) {
           s1Cats++;
       } else {
           commonCats++;
       }
    });

    s2.categoriesKeys.forEach( v => {
        let idx = s1.categoriesKeys.indexOf(v);
        if (idx === -1) {
            s2Cats++;
        }
    });

    return Math.min( commonCats, s2Cats, s1Cats );
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
        if (v.id !== undefined) {
            return v.id;
        } else {
            return v[0].id + ' ' + v[1].id;
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
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}


function getArraysFromText(text) {
    let formattedInput = text.split(/\n/).map((v, id) => {
        let parsedV = v.split(' ');

        let categories = {};
        let categoriesSize = 0;
        let categoriesKeys = [];

        for (let i = 0; i <= parsedV[1]; ++i) {

            if (parsedV[i + 2]) {
                categories[parsedV[i + 2]] = 1;
                categoriesKeys.push(parsedV[i + 2]);
                categoriesSize++;
            }
        }
        categoriesKeys.sort();
        return {
            id: id - 1,
            used: false,
            categoriesSize,
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
    let categoriesH = {};
    let categoriesV = {};

    slides.forEach(slide => slide.categoriesKeys.forEach(val => {
        if (slide.type === "H") {
            if (categoriesH[val]) {
                categoriesH[val].push(slide);
            } else {
                categoriesH[val] = [slide];
            }
        } else {
            if (categoriesV[val]) {
                categoriesV[val].push(slide);
            } else {
                categoriesV[val] = [slide];
            }
        }
    }));

    return {categoriesH, categoriesV}
}
