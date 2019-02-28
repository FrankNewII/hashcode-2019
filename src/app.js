function run(e) {
    e.preventDefault();
    let input = document.getElementById('input').value.split(/\n/).map( (v, id) => {
        let parsedV = v.split(' ');
        parsedV.unshift(id);

        return parsedV;
    } );

    input.shift();
    input.pop();

    let outputArtem = artem(input);
    let outputDenis = denis(input);
    let outputAlexnder = alexander(input);



    document.getElementById('output').value = JSON.stringify(input);
}

window.run = run;

function artem(input) {

}

function denis(input) {

}

function alexander(input) {

}
