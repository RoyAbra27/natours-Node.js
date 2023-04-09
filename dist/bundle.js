/* eslint-disable*/ // import 'core-js/stable';
// import axios from 'axios';
/* eslint-disable*/ // success / error
/*eslint-disable*/ const $aacb8cd1916d432d$export$de026b00723010c1 = (type, msg)=>{
    $aacb8cd1916d432d$export$516836c6a9dfc573();
    const markup = `<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector("body").insertAdjacentHTML("afterbegin", markup);
    window.setTimeout($aacb8cd1916d432d$export$516836c6a9dfc573, 5000);
};
const $aacb8cd1916d432d$export$516836c6a9dfc573 = ()=>{
    const el = document.querySelector(".alert");
    if (el) el.parentElement.removeChild(el);
};


const $2359206674280748$export$596d806903d1f59e = async (email, password)=>{
    try {
        const res = await axios({
            method: "POST",
            url: "/api/v1/users/login",
            data: {
                email: email,
                password: password
            }
        });
        if (res.data.status === "success") {
            (0, $aacb8cd1916d432d$export$de026b00723010c1)("success", "Logged in successfully!");
            window.setTimeout(()=>{
                location.assign("/");
            }, 1000);
        }
    } catch (error) {
        (0, $aacb8cd1916d432d$export$de026b00723010c1)("error", error.response.data.message);
    }
};
const $2359206674280748$export$a0973bcfe11b05c9 = async ()=>{
    try {
        const res = await axios({
            method: "GET",
            url: "/api/v1/users/logout"
        });
        res.status = "success";
        location.reload(true);
    } catch (error) {
        // console.log(error);
        (0, $aacb8cd1916d432d$export$de026b00723010c1)("error", error.response.data.message);
    }
};


/* eslint-disable*/ const $b1881d2d36b9b1c3$export$4c5dd147b21b9176 = (locations)=>{
    var map = tt.map({
        key: "aswuJFdV8UlNpye0AEuR9AA81M8gCZ8R",
        container: "map",
        style: "https://api.tomtom.com/style/1/style/21.1.0-*/?map=basic_main-lite&poi=poi_main",
        scrollZoom: false
    });
    const bounds = new tt.LngLatBounds();
    locations.forEach((location)=>{
        const newMarker = document.createElement("div");
        newMarker.className = "marker";
        new tt.Marker({
            element: newMarker
        }).setLngLat(location.coordinates).addTo(map);
        new tt.Popup({
            offset: 30
        }).setLngLat(location.coordinates).setHTML(`<p>Day ${location.day}: ${location.description}</p>`).addTo(map);
        bounds.extend(location.coordinates);
    });
    map.fitBounds(bounds, {
        padding: {
            top: 250,
            bottom: 150,
            left: 50,
            right: 50
        }
    });
};


/* eslint-disable*/ 
const $6ac5ade5daeb1746$export$3bf0495508a61ee = async (data, type)=>{
    try {
        const res = await axios({
            method: "PATCH",
            url: `/api/v1/users/update-my-${type}`,
            data: data
        });
        if (res.data.status === "success") {
            (0, $aacb8cd1916d432d$export$de026b00723010c1)("success", `${type[0].toUpperCase() + type.slice(1)} updated successfully!`);
            location.reload(true);
        }
    } catch (error) {
        (0, $aacb8cd1916d432d$export$de026b00723010c1)("error", error.response.data.message);
    }
};


/*eslint-disable */ 
const $d4a631fe91d89b04$var$stripe = Stripe("pk_test_51Mt761BIY599TDnaGhOcLDYa0yALsq91eFBWyyC9NpccPLllCBCxdLyAhjzm5Cr0zIexc7cSJEpEXegleGXSxSCX00u8Ml1xPm");
const $d4a631fe91d89b04$export$8d5bdbf26681c0c2 = async (tourId)=>{
    try {
        const session = await axios(`/api/v1/booking/checkout-session/${tourId}`);
        location.assign(session.data.url);
    } catch (error) {
        // console.log(error.response.data);
        (0, $aacb8cd1916d432d$export$de026b00723010c1)("error", error);
    }
};


const $404e9fa2a66ba856$var$mapDisplay = document.getElementById("map");
const $404e9fa2a66ba856$var$loginForm = document.querySelector(".form--login");
const $404e9fa2a66ba856$var$logOutBtn = document.querySelector(".nav__el--logout");
const $404e9fa2a66ba856$var$userDataForm = document.querySelector(".form-user-data");
const $404e9fa2a66ba856$var$userPasswordForm = document.querySelector(".form-user-password");
const $404e9fa2a66ba856$var$bookBtn = document.getElementById("book-tour");
if ($404e9fa2a66ba856$var$mapDisplay) {
    const locations = JSON.parse($404e9fa2a66ba856$var$mapDisplay.dataset.locations);
    (0, $b1881d2d36b9b1c3$export$4c5dd147b21b9176)(locations);
}
if ($404e9fa2a66ba856$var$loginForm) $404e9fa2a66ba856$var$loginForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    (0, $2359206674280748$export$596d806903d1f59e)(email, password);
});
if ($404e9fa2a66ba856$var$logOutBtn) $404e9fa2a66ba856$var$logOutBtn.addEventListener("click", (0, $2359206674280748$export$a0973bcfe11b05c9));
if ($404e9fa2a66ba856$var$userDataForm) $404e9fa2a66ba856$var$userDataForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    const form = new FormData();
    form.append("name", document.getElementById("name").value);
    form.append("email", document.getElementById("email").value);
    form.append("photo", document.getElementById("photo").files[0]);
    (0, $6ac5ade5daeb1746$export$3bf0495508a61ee)(form, "profile");
});
if ($404e9fa2a66ba856$var$userPasswordForm) $404e9fa2a66ba856$var$userPasswordForm.addEventListener("submit", async (e)=>{
    e.preventDefault();
    document.querySelector(".btn--save-password").textContent = "Updating...";
    const passwordCurrent = document.getElementById("password-current").value;
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("password-confirm").value;
    await (0, $6ac5ade5daeb1746$export$3bf0495508a61ee)({
        passwordCurrent: passwordCurrent,
        password: password,
        passwordConfirm: passwordConfirm
    }, "password");
    document.querySelector(".btn--save-password").textContent = "Save password";
    document.getElementById("password-current").value = "";
    document.getElementById("password").value = "";
    document.getElementById("password-confirm").value = "";
});
if ($404e9fa2a66ba856$var$bookBtn) $404e9fa2a66ba856$var$bookBtn.addEventListener("click", (e)=>{
    e.target.textContent = "Processing...";
    const { tourId: tourId  } = e.target.dataset;
    (0, $d4a631fe91d89b04$export$8d5bdbf26681c0c2)(tourId);
});


//# sourceMappingURL=bundle.js.map
