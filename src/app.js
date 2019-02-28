function onChange(e) {
    var input = event.target;

    var reader = new FileReader();

    console.log("change");
    reader.onload = function(){
        console.log("Load");
        var text = reader.result;

        let formatedInput = text.split(/\n/).map( (v, id) => {
            let parsedV = v.split(' ');
            parsedV.unshift(id - 1);

            return parsedV;
        } );

        formatedInput.shift();

        let outputArtem = artem(formatedInput);
        let outputDenis = denis(formatedInput);
        let outputAlexnder = alexander(formatedInput);

    };

    reader.readAsText(input.files[0]);
}

window.run = run;
window.onChange = onChange;

function artem(input) {
    console.log(input);
    let categoriesH = {};
    let categoriesV = {};
    let used = [];

    input.forEach( slide => slide.forEach( (val, id) => {
        if ( id >= 3 ) {
            if (slide[1] === "H") {
                if ( categoriesH[val] ) {
                    categoriesH[val].push(slide[0]);
                } else {
                    categoriesH[val] = [slide[0]];
                }
            } else {
                if ( categoriesV[val] ) {
                    categoriesV[val].push(slide[0]);
                } else {
                    categoriesV[val] = [slide[0]];
                }
            }

        }
    }) );

    let lastCategory;
    let newCategory;

    let keysH = Object.keys(categoriesH);

    keysH.forEach( cat => {
        categoriesH[cat].forEach()
    });
    console.log();
}

function denis(input) {

}

function alexander(input) {

}
