console.log("helpppppppppppppppppp")

// Ensure loggedIn logic works correctly
const loggedInElement = document.getElementById('loggedinas');
const loggedIn = loggedInElement && loggedInElement.innerText !== "nobody";
console.log('Logged in:', loggedIn);

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
        window.location.href = 'signup.html';
    });
} else {
    console.error('Signup button not found');
}

if (loginButton) {
    loginButton.addEventListener('click', function() {
        window.location.href = 'login.html';
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
document.querySelectorAll('.post').forEach(post => {
    const postId = post.id.split("#")[1]
    post.onclick = ()=>{
        window.location.href = `/?post=${postId}`
    }
})
const postn = window.location.search.split("?post=")[1]
if (postn !== undefined) {
    const post = document.getElementById(`post#${postn}`)
    document.getElementById("psec").innerHTML = '<div class="wholepost">'+post.innerHTML+`
        <form method="POST" action="/delete">
            <input type="hidden" name="postn" value="${postn}">
            <button type="submit">Delete</button>
        </form>
    `+"</div>"
}
if (!loggedIn){
    document.getElementById("nreqbtn").style.display = "none"
    document.getElementById("postsection").style.display = "none"
}