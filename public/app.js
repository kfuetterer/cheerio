$( document ).ready(function() {

  $.getJSON("/articles", function(data) {
    for (var i = 0; i < data.length; i++) {
      $("#articles").append("<tr><td data-id='" + data[i]._id + "' >" + data[i].link + "</td><td>" + data[i].headline + "</td><td>" + data[i].summary + "</td><td><button data-id='" + data[i]._id + "' id='commentButton' class='btn btn-primary center-block'>Comment</button></td></tr>");
    }
  });

  $.getJSON("/comments", function(data) {
    for (var i = 0; i < data.length; i++) {
      $("#comments").append("<tr><td>" + data[i].title + "</td><td>" + data[i].body + "</td></tr>");
    }
  })

  $(document).on("click", "#commentButton", function() {
    var ID = $(this).attr("data-id");
    $.ajax({
      method: "GET",
      url: "/articles/" + ID
    })
      .done(function(data) {

        $("#comment").append("<h4>" + data.headline + "</h4>");
        $("#comment").append("<input id='titleinput' name='title' ><br>");
        $("#comment").append("<textarea id='bodyinput' name='body'></textarea><br>");
        $("#comment").append("<button data-id='" + data._id + "' id='savecomment' class='btn btn-primary center-block'>Save Comment</button>");

        if (data.comment) {

          $("#titleinput").val(data.comment.title);
          $("#bodyinput").val(data.comment.body);
        }
      });
  });

  $(document).on("click", "#savecomment", function() {
    var thisId = $(this).attr("data-id");

    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        title: $("#titleinput").val(),
        body: $("#bodyinput").val()
      }
    })
      .done(function(data) {
        console.log(data);
        $("#comments").empty();
      });

    $("#titleinput").val("");
    $("#bodyinput").val("");
  });
});