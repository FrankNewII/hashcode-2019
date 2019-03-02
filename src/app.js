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

    let slide = slides[0];
    let category = slide.categories.shift();
    let lastSemiResult;

    while(category) {

        let addedPics = getPicsFromCat(category, categoriesV);

        if (addedPics.addedSlides) {

            result.push(...addedPics.semiRes);
            lastSemiResult = addedPics.semiRes;
            slide = addedPics.semiRes[addedPics.semiRes.length - 1];

        } else {

            if (slide.categories.length) {
                category = slide.categories.shift();
            } else {


                if (lastSemiResult.length) {

                    let firstSlide = lastSemiResult.shift();
                    let lastSlide = result[result.length - 1];

                    result[result.length - 1] = firstSlide;

                    let firstSlideResultPos = result.indexOf(firstSlide);
                    result[firstSlideResultPos] = lastSlide;


                    slide = firstSlide;
                    category = slide.categories.shift();


                } else {
                    category = null;
                }

            }

        }

    }

    let vRes = [];

    while(result.length) {
        let v1 = result.shift();
        let v2 = result.shift();

        if (v1 && v2) {
            vRes.push([v1, v2]);
        }
    }

    download('res', generateResultFromSlides(vRes));
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

        let categories = [];

        for (let i = 0; i <= parsedV[1]; ++i) {

            if (parsedV[i + 2]) {
                categories.push(parsedV[i + 2]);
            }
        }

        return {
            id: id - 1,
            used: false,
            categoriesSize: categories.length,
            type: parsedV[0],
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

    slides.forEach(slide => slide.categories.forEach(val => {
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
