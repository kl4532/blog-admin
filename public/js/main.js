$(document).ready(()=>{
  $('.delete-article').on('click', (e)=>{
    $target = $(e.target);
    const id = $target.attr('data-id');
    $.ajax({
      type: "DELETE",
      url: '/articles/'+id,
      success: (response)=>{
        alert('Deleting Article');
        window.location.href="/";
      },
      error: (err)=>{
        console.log(err);
      }
    });
  });
  $('.delete-comment').on('click', (e)=>{
    $target = $(e.target);
    const id = $target.attr('data-id');
    const cid = $target.attr('data-cid');
    $.ajax({
      type: "DELETE",
      url: `/articles/?id=${id}&cid=${cid}`,
      success: (response)=>{
        alert('Deleting Comment');
        window.location.href="/articles/"+id;
      },
      error: (err)=>{
        console.log(err);
      }
    });
  });
});
