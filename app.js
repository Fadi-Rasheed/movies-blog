const root = document.querySelector('.root');

document.addEventListener('click',(event)=>findClick(event));

function tmpl(movies=[],reviews=[],movieId=0,movie={}){ 
    let review = reviews.filter(element => element.movieId == movieId);
    let tmplObj = {
    'home': `<p class="home">Welcome to Home page</p>`,
    'add':  `<form action="/movies" method="POST" class="form__add__movie">
                <input class="input__title" type="text" name="text" id="add-new" placeholder="Title" required>
                <input class="input__rate" type="text" name="text" id="add-new" placeholder="Rate" required>
                <input class="input__upload" type="text" id="avatar" name="avatar" placeholder="Add Poste URl" required>
                <input class="input__submit" type="submit" value="submit">
            </form>`,
    'movies': `<ul class="movies-list">${generatMovies(movies) || "empty"}</ul>`,
    'movie':`
            <h2 class="film-title" id="${movie.id}">${movie.title || "empty"}</h2>
            <p class="film-rate">Rate: ${movie.rate || "empty"}</p>
            <img class="film-img" src="${movie.src}">
            <h2 class="reviews">Reviews</h2>
            <ul class="reviews-list">
                ${generatReviews(review) || "empty"}
            </ul>
            <h2 class="add-review-p">Add your Review</h2>
            <form class="form__add__review" action="" method="post">
                <input class="review-name" type="text" name="name" id="name" placeholder="add your name" required>
                <textarea class="review-text-area" name="review" id="" cols="30" rows="10" placeholder="add your review" required></textarea>
                <input class="review-submit" type="submit" value="submit">
            </form>`,
    'about':`<p class="about">About Page</p>`,
    'error':`<p class="error">Error 404 Page was not found</p>`,
   
    }
return tmplObj
}

function generatMovies(listOfMovies){
    if (listOfMovies)   {   return listOfMovies.map(elem => `<li>
                            <a id="${elem.id}" href="/movies/${elem.id}">Title: ${elem.title || "empty"} Rate: ${elem.rate || "empty"}</a>
                            <img src="${elem.src || '#'}">
                        </li>`).join("");}
}

function generatReviews(listOfReviews){
    return listOfReviews.map(elem => `<li>
                                        <p>${elem.name || "empty"}</p>
                                        <p>${elem.body || "empty"}</p>
                                    </li>`).join("");
}

function renderPage(pathUrl,movieId){
    let movies;
    let reviews = [];
    if (movieId) {
        fetch(`http://localhost:3000/movies/${movieId}`)
        .then(res=> res.json())
        .then(data => {
            movies = data
            if(Object.keys(data).length === 0){
                throw Error("error")
            } else {
            return fetch('http://localhost:3000/reviews')
        }
        })
        .then(res=> res.json())
        .then(data2 => {
            let template = tmpl(null,data2,movieId,movies);
            root.innerHTML = template.movie;
            let form = root.querySelector('form');
            form.addEventListener('submit',function(event){ 
                event.preventDefault();
                postreview(this,movies.id)});
            })
        .catch(err => {
            console.log(err)
            let template = tmpl();
            root.innerHTML = template.error;
        })  
    } else if(pathUrl === "" || pathUrl === "home") {
        let template = tmpl();
        root.innerHTML = template.home;
    } else if (pathUrl === "movies" && !movieId){
        fetch(`http://localhost:3000/movies`)
        .then(res=> res.json())
        .then(data => {
            let template = tmpl(data,reviews,movieId);
            root.innerHTML = template.movies;
            })
    } else if (pathUrl === "add") {
        let template = tmpl();
        root.innerHTML = template.add;
        let form = root.querySelector('form');
        form.addEventListener('submit',function(event){ 
            event.preventDefault();
            addNewMovie(this)});
    } else if (pathUrl === "about") {
        let template = tmpl();
        root.innerHTML = template.about;
    } else {
        let template = tmpl();
        root.innerHTML = template.error;
    }
}

function findPage(){
    let pathName = window.location.pathname;
    let pathUrlArray = pathName.split('/');
    let pathUrl = pathUrlArray[1];
    let movieId = pathUrlArray[2] || null;
    if(pathUrl !== "movies" && pathName.split('/').length <= 2){
        renderPage(pathUrl)
    } else if(pathUrl === "movies" && pathName.split('/').length <= 3){
        renderPage(pathUrl,movieId)
    } else {
        let template = tmpl();
        root.innerHTML = template.error;
    }
}

function findClick(event){
    if(event.target.tagName.toLowerCase() === 'a') {
        event.preventDefault();
        const eventId = event.target.href;
        window.history.pushState(null,null,`${eventId}`)
        findPage();
    }
}

function postreview(form,movieId){
    let name = form.querySelector('input').value;
    let body = form.querySelector('textarea').value;
    console.log(name,body)
    fetch('http://localhost:3000/reviews',{
    method:'POST',
    body:JSON.stringify({
        name :name,
        body: body,
        movieId: movieId
    }),
    headers : {
    "Content-Type": "application/json"
}
}).then((data)=> data.json()).then(data => appendReview(data,form));
}

function addNewMovie(form){
    let inputs = form.querySelectorAll('input');
    let title = inputs[0].value;
    let rate = inputs[1].value;
    let src = inputs[2].value;;
    console.log(title,rate,src)
    fetch('http://localhost:3000/movies',{
    method:'POST',
    body:JSON.stringify({
        title :title,
        rate:rate,
        src: src
    }),
    headers : {
    "Content-Type": "application/json",
}
})
.then((data)=> data.json())
.then(data => {
    window.history.replaceState(null,null,'movies/'+`${data.id}`);
    findPage();
});
}

function appendReview(data,form){
   let newReview =  generatReviews([data]);
   document.querySelector('.reviews-list').innerHTML += newReview;
   form.reset();
}
window.onpopstate = findPage;

findPage();