const SERVER = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", function() {
    const list = document.querySelector("#list");
    const showPanel = document.querySelector("#show-panel");

    // given a book object, add it to the title list
    const addTitleToList = book => {
        const li = document.createElement('li');
        li.dataset.id = book.id;
        li.textContent = book.title;
        list.appendChild(li);
    }

    // given a book ID, load it into the show-panel
    const loadBookInfo = id => {
        fetch(`${SERVER}/books/${id}`)
        .then(resp => resp.json())
        .then(book => {
            // boolean for checking if user with id=1 has liked this book
            let liked = false;
            
            // most of the panel html
            showPanel.innerHTML = `
                <img src=${book.img_url} alt=${book.title} />
                <br>
                <h2>${book.title}</h2>
                <h3>${book.subtitle}</h3>
                <h3>${book.author}</h3>
                <p>${book.description}</p>
                <p><em>Liked by:</em></p>
            `
            // unorder list of users
            let usersList = document.createElement('ul');
            showPanel.appendChild(usersList);

            // create & add each user li
            book.users.forEach(user => {
                let userLi = document.createElement('li');
                userLi.textContent = user.username;
                userLi.dataset.id = user.id;
                usersList.appendChild(userLi);

                if (user.id === 1) { liked = true; }
            })

            // create & add like button
            let likeButton = document.createElement('button');
            likeButton.id = "like-button";
            likeButton.textContent = liked ? "UNLIKE" : "LIKE";
            showPanel.appendChild(likeButton);

            // add event listener for like button
            likeButton.addEventListener("click", event => {
                // update users list
                let newUsers = book.users;
                if (liked) {
                    newUsers = newUsers.filter(user => user.id !== 1);
                } else {
                    newUsers.push({id: 1, username: "pouros"})
                }
                
                // patch the book
                fetch(`${SERVER}/books/${id}`, {
                    method: "PATCH",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({users: newUsers})
                })
                .then(resp => resp.json())
                .then(book => {
                    if (liked) {
                        // remove the user from the list and change the button to say LIKE
                        usersList.querySelector("[data-id='1']").remove();
                        likeButton.textContent = "LIKE";
                    } else {
                        // add the user to the list and change the button to say UNLIKE
                        let userLi = document.createElement('li');
                        userLi.textContent = "pouros";
                        userLi.dataset.id = 1;
                        usersList.appendChild(userLi);
                        likeButton.textContent = "UNLIKE";
                    }

                    // update the value of liked
                    liked = !liked;
                })
            })
        })
        .catch(error => {
            showPanel.innerHTML = `<p style="color: red;">There was an error: ${error}</p>`;
        });
    }

    // populate title list
    fetch(`${SERVER}/books`)
    .then(resp => resp.json())
    .then(books => books.forEach(addTitleToList));

    list.addEventListener("click", event => {
        if (event.target.nodeName === "LI") { loadBookInfo(event.target.dataset.id); }
    })
});
