function run(e) {
    e.preventDefault();
    let input = document.getElementById('input').value.split(/\n/).map( (v, id) => {
        let parsedV = v.split(' ');
        parsedV.unshift(id);

        return parsedV;
    } );

    input.shift();







    document.getElementById('output').value = JSON.stringify(input);
}

window.run = run;
