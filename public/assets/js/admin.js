//Delete product in Admin

const removeObjSuccess = obj => {
    const id = obj.id;
    const nameObj = obj.name;
    // console.log(`table tbody .${nameObj}[data-id=${id}]`)
    $(`table tbody .${nameObj}[data-id=${id}]`).remove();
};

const removeObjFailed = () => {
    alert("FAIL DELETING");
};

$("table tbody button.delete").on("click", function() {
    const id = $(this).attr("data-id");

    const obj = $(this).attr("name");

    // console.log("GetGET", ProID);

    $.ajax({
            url: `${obj}/delete/${id}`,
            method: "DELETE"
        })
        .then(removeObjSuccess)
        .catch(removeObjFailed);
});

// Update Permission for User/seller
const updatePermisson = user => {
    const id = user.id;
    const permission = user.permission;

    var rowUser = $(`#${id}`).html();

    const buttonDown = `<i class="fas fa-arrow-down fa-lg"></i>`;
    const buttonUp = `<i class="fas fa-arrow-up fa-lg"></i>`;

    var rowToAdd = $(`#${id}`).remove();

    console.log($(`tbody .user`));
    if (!permission) {
        rowUser = rowUser.replace("aqua-gradient", "peach-gradient");
        rowToAdd =
            `<tr id=${id}>` + rowUser.replace(buttonDown, buttonUp) + `</tr>`;
        $(`tbody.bidders`).append(rowToAdd);
    } else {
        rowUser = rowUser.replace("peach-gradient", "aqua-gradient");
        rowToAdd =
            `<tr id=${id}>` + rowUser.replace(buttonUp, buttonDown) + `</tr>`;
        $(`tbody.sellers`).append(rowToAdd);
    }
    //Xoá request

    $.ajax({
            url: `users/delete/request/${id}`,
            method: "DELETE"
        })
        .then(removeObjSuccess)
        .catch(removeObjFailed);
};

const updatePermissonFail = () => {
    alert("Fail update Permission");
};

$(document).on("click", ".permission", function() {
    const id = $(this).attr("data-id");
    const permission = $(this).attr("data-state");

    let condition = permission === "0" ? 0 : 1;

    $.ajax({
            url: `users/${id}/${!condition}`,
            method: "PUT"
        })
        .then(updatePermisson)
        .catch(updatePermissonFail);
});