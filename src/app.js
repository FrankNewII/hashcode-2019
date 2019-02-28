function run(e) {
    e.preventDefault();

    let input = document.getElementById('input').value.split(/\n/).map( (v, id) => {
        let parsedV = v.split(' ');
        parsedV.unshift(id - 1);

        return parsedV;
    } );
}

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
}

function denis(input) {

}

function alexander(input) {

}
