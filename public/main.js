

// Ensure loggedIn logic works correctly
const loggedInElement = document.getElementById('loggedinas');
const loggedIn = loggedInElement && loggedInElement.innerText !== "nobody";
console.log('Logged in:', loggedIn);

console.log(loggedIn)
function textToHTML(text) {
    return text.replace(/(?:\r\n|\r|\n)/g, '<br>');
}
console.log("skibidi")
document.getElementById('loggedinas2').innerText = document.getElementById('loggedinas').innerText; // Update logged in user display

// Debug login and signup buttons
const signupButton = document.getElementById('signup-button');
const loginButton = document.getElementById('login-button');

if (signupButton) {
    signupButton.addEventListener('click', function() {
        window.location.href = 'public/signup.html';
    });
} else {
    console.error('Signup button not found');
}

if (loginButton) {
    loginButton.addEventListener('click', function() {
        window.location.href = 'public/login.html';
    });
} else {
    console.error('Login button not found');
}

document.getElementById('post-content').addEventListener('change', function() {
    const text = this.value
    const title = document.getElementById("name").value
    const file = document.getElementById("file").value
    const filename = document.getElementById("filename").textContent
    const user = document.getElementById('loggedinas').innerText
    document.getElementById('post-preview').innerHTML = 
    `
    <h3>${title}</h3>
    <p>By ${user}</p><br>
    <p>By ${user}</p><br>
    <p>${textToHTML(text)}</p>
    ${
        file.length ? `<br><a download="${filename}.psave" href="data:text/base64,">Download ${filename}</a>`: ``
    }`
});
document.getElementById('file').addEventListener("change", function(){

    const fr = new FileReader()
    fr.onload = function(){
        document.getElementById("filehidden").value = fr.result
    }
    fr.readAsText(document.getElementById("file").files[0])
})

// Control visibility of elements based on loggedIn
document.getElementById('nreqbtn').style.display = !loggedIn ? "block" : "none";
document.getElementById('postsection').style.display = !loggedIn ? "block" : "none";

const posts = document.querySelectorAll(".post")
posts.forEach(p => {
    const postId = p.id.split("#")[1]
    p.addEventListener("click", ()=>{
        
        window.location.href = `/?post=${postId}`
    })
})
window.onload =()=> {
    const url = new URL(window.location.href);
    const post = url.searchParams.get("post");
    if (post !== null) {
        document.body.innerHTML = document.getElementById("post#"+post).innerHTML+`<br>
            <form action="/delete.html" method="POST">
                <input style="display:none" name="postn" type="number" value="${post}">
                <button type="submit">Delete</button>
            </form>
            
        `
    }
}
console.log('main.js is loaded');