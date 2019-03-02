function onChange(e) {
    var input = event.target;

    var reader = new FileReader();

    console.log("change");
    reader.onload = function () {
        console.log("Load");
        var text = reader.result;

        let formatedInput = text.split(/\n/).map((v, id) => {
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

        formatedInput.shift();
        formatedInput.length--;

        let categoriesH = {};
        let categoriesV = {};

        formatedInput.forEach(slide => slide.categories.forEach(val => {
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

        artem(formatedInput, categoriesH, categoriesV)
    };

    reader.readAsText(input.files[0]);
}

window.onChange = onChange;

function artem(input, categoriesH, categoriesV) {
    console.log(input);




    let result = [];



    let startedPic = input[0];
    let usedPics = 1;
    startedPic.used = true;

    function getPic(startedPic) {
        startedPic.categories.forEach(cat => {
            categoriesH[cat].forEach(pic => {
                if (!pic.used) {
                    result.push(pic);
                    pic.used = true;
                    getPic(pic);
                }
            })
        });
    }


    //result.push(input[0]);
    //getPic(input[0]);

    //console.log(result);

    let lastCategory;
    let totalSlides = 0;
    let keysH = Object.keys(categoriesH).sort();

    let usedCat = {};
    function getPicsFromCat(cat) {
        let semiRes = [];
        let lastAddedPic;
        categoriesH[cat].forEach(slide => {
            if (!slide.used) {
                totalSlides++;
                semiRes.push(slide);
                slide.used = true;

                lastAddedPic = slide;
            }
        });

        return {semiRes, lastAddedPic}
    }

    let lastCatId = 0;

    let lastCatName = keysH[lastCatId];
    let semiSize = 0;

    let replaceTest = 0;

    while(lastCatName) {
        usedCat[lastCatName] = 1;

        let lastCat = getPicsFromCat(lastCatName);

        if (lastCat.lastAddedPic !== undefined ) {
            semiSize = lastCat.semiRes.length;
        }

        if (lastCat.lastAddedPic === undefined ) {

            if (replaceTest >= 0) {
                let lastResultIdx = result.length - 1;
                let lastSlide = result[lastResultIdx];

                result[lastResultIdx] = result[ replaceTest ];
                result[ replaceTest ] = lastSlide;
                replaceTest--;
                lastCatName = result[lastResultIdx].categories[ result[lastResultIdx].categoriesSize - 1 ];

                continue;
            } else {
                break;
            }

        } else {
            replaceTest = lastCat.semiRes.length - 2;
            result.push( ...lastCat.semiRes );
        }

        let catSize = lastCat.lastAddedPic.categoriesSize;

        while(catSize > 0) {

            let currentCat = lastCat.lastAddedPic.categories[catSize - 1];

            if (usedCat[currentCat]) {
                catSize--;
            } else {
                lastCatName = currentCat;
                break;
            }
        }
    }



    /*
        *
        * предложение бегать по категориям каждой фотографии и выбирать первую подходящую не использованую из этой категории
        *
        * */
    result = result.map(v => {
        if (v.id !== undefined) {
            return v.id;
        } else {
            return v[0].id + ' ' + v[1].id;
        }
    });

    let resStr = result.length + '\n' + result.join('\n');
    //console.log(result);

    download('res', resStr);
    //console.log(resStr);
}

/*
* if (currentCatV) {
            let currentVSlide = [];
            let vSlideLen = 0;

            currentCatV.forEach(V => {
                if (vSlideLen < 2 && !V[1] && V.indexOf(nextCat) !== -1) {
                    currentVSlide.push(V);
                    V[1] = true;
                    vSlideLen++;
                }
            });

            if (vSlideLen === 2) {
                result.push(currentVSlide);
            }

        } else {
            let idx = result.length - 1;

            while (idx >= startCatIdx) {
                let lastResCats = [];

                let idx = idx === undefined ? result.length - 1 : --idx;

                result[idx].forEach((v, id) => {
                    if (id >= 4) {
                        lastResCats.push(v);
                    }
                });
            }

        }
        */


function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}
