(function($) {
    // Preloader
    $(window).on("load", function() {
        if ($("#preloader").length) {
            $("#preloader")
                .delay(100)
                .fadeOut("slow", function() {
                    $(this).remove();
                });
        }
    });

    // Back to top button
    $(window).scroll(function() {
        if ($(this).scrollTop() > 100) {
            $(".back-to-top").fadeIn("slow");
        } else {
            $(".back-to-top").fadeOut("slow");
        }
    });
    $(".back-to-top").click(function() {
        $("html, body").animate({ scrollTop: 0 }, 1500, "easeInOutExpo");
        return false;
    });
    /*--/ Property owl owl /--*/
    $("#property-single-carousel").owlCarousel({
        loop: true,
        margin: 0,
        nav: true,
        navText: [
            '<i class="ion-ios-arrow-back" aria-hidden="true"></i>',
            '<i class="ion-ios-arrow-forward" aria-hidden="true"></i>'
        ],
        responsive: {
            0: {
                items: 1
            }
        }
    });

    //Thêm sản phẩm vào danh sách ưa thích

    const displayAddedToWishlist = Pro => {
        const ProID = Pro.ProID;

        $(`.heart-icon[data-id=${ProID}]`).addClass("active");
        $(`.heart-icon[data-id=${ProID}]`).attr("disabled", "disabled");
    };

    const addToWishListFail = response => {
        alert("Add to wishlist just for BIDDER!!!");
    };

    $(document).on("click", ".heart-icon", function() {
        const ProID = $(this).attr("data-id");
        const ProName = $(this).attr("data-name");
        const Price = $(this).attr("data-price");

        // console.log($(this).attr("disabled"));

        if ($(this).attr("disabled") === "disabled") {
            console.log("just tesing");
        } else {
            console.log("clicked!!");
            $.ajax({
                    url: "bd/wishlist/add",
                    method: "POST",
                    data: {
                        ProID: ProID,
                        ProName: ProName,
                        Price: Price
                    }
                })
                .then(displayAddedToWishlist)
                .catch(addToWishListFail);
        }
    });

    //Gửi yêu cầu nâng cấp tài khoản

    const displayRequested = check => {
        $(`.request-upgrade`).text(`Đã yêu cầu`);
        $(`.request-upgrade`).prepend(`<i
        class="fas fa-wrench pr-2">`);
        $(`.request-upgrade`).attr("disabled", "disabled");
    };

    const requestFail = response => {
        alert("Can't Request Update!");
    };

    $(document).on("click", ".request-upgrade", function() {
        // console.log($(this).attr("disabled"));

        if ($(this).attr("disabled") === "disabled") {
            console.log("just tesing");
        } else {
            console.log("clicked!!");
            $.ajax({
                    url: "account/request",
                    method: "POST"
                })
                .then(displayRequested)
                .catch(requestFail);
        }
    });

    //Gửi yêu cầu đấu giá

    //Nếu rate trên 0.8 thì thực hiện đấu giá luôn
    //Cập nhật lại giá
    //Cập nhật lại userID người đấu giá cao nhất
    //Cập nhật lại biddinglist với các

    //Nếu rate dưới 0.8 thì
    //Sau khi click
    //Xoá input và label
    //Đổi text của button thành Đang đợi duyệt và disable button

    //Nhớ phải thêm hàm check dang đợi duyêt của USERIDcurrent
    //Và chỉ show button với trang thái giống như client

    //Nếu đang đợi thì không được đấu giá cho đến khi UserID không còn nằm trong watiting list

    const BIDRequested = check => {
        // const ProID = check.ProID;

        const Rated = $("#BID-button").attr("data-rated");
        const Step = $(`#PriceBID`).attr("step");
        //Nếu rate>=0.8
        if (Rated >= 0.8) {
            const Price = check.Price;
            console.log(Price);
            console.log($(`#PriceCurrent`).text());
            $(`#BID-button`).attr("disabled", "disabled");
            $(`#PriceCurrent strong`).text(`${Price}`);
            // $(`#PriceCurrent`).prepend(`<i class="fas fa-dollar-sign">`);
            $(`label .grey-text`).text(
                `Ra giá - Đề xuất: ${Step}! with Step: ${Step}`
            );
        } else {
            //Nếu rate<0.8
            $(`form.area-to-input`).remove();
            $(`#BID-button`).text(`Đang đợi duyệt`);
            $(`#BID-button`).prepend(
                `<i class="fas fa-gavel mr-2 pr-2" aria-hidden="true"></i>`
            );
            $(`#BID-button`).attr("disabled", "disabled");
        }
    };

    const BIDRequestFail = response => {
        alert("Can't BID!");
    };

    $(document).on("click", "#BID-button", function() {
        // console.log($(this).attr("disabled"));

        const ProID = $(this).attr("data-state");
        const Rated = $(this).attr("data-rated");
        const Price = $("#PriceBID").val();
        var obj = "";
        if (Price === "") {
            return;
        }
        if (Rated >= 0.8) {
            obj = "bid";
        } else {
            obj = "wait";
        }
        var ProIDInt = parseInt(ProID, 10);
        var PriceInt = parseInt(Price, 10);

        console.log(`hi`, Rated);
        console.log(Price);
        console.log(obj);

        if (PriceInt === NaN) {
            return;
        }
        if ($(this).attr("disabled") === "disabled") {
            console.log("just tesing");
        } else {
            console.log("clicked!!");

            $.ajax({
                    url: `products/:id/${obj}`,
                    method: "POST",
                    data: {
                        ProID: ProIDInt,
                        Price: PriceInt,
                        Time: "2020-01-03 08:00:21",
                        Status: 1 //Trạng thái đang giữ giá
                    }
                })
                .then(BIDRequested)
                .catch(BIDRequestFail);
        }
    });
})(jQuery);