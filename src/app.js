function run(e) {
    e.preventDefault();
    let input = document.getElementById('input').value.split(/\n/).map( (v, id) => v.split(' '));

    document.getElementById('output').value = JSON.stringify(input);


}

window.run = run;
