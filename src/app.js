function run(e) {
    e.preventDefault();
    let input = document.getElementById('input').value.split(/\n/).map( (v, id) => {
        let parsedV = v.split(' ');
        parsedV.unshift(id - 1);

        return parsedV;
    } );

    input.shift();

    let outputArtem = artem(input);
    let outputDenis = denis(input);
    let outputAlexnder = alexander(input);

    document.getElementById('output').value = JSON.stringify(input);
}

window.run = run;

function artem(input) {
    console.log(input);
}

function denis(input) {

}

function alexander(input) {

}
