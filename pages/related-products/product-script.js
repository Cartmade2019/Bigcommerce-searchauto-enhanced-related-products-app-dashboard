// pages/script.js
function Script() {
    return null;
  }
  
  export async function getServerSideProps(context) {
    context.res.setHeader('Content-Type', 'application/javascript');
    context.res.setHeader('Cache-Control', 'public, max-age=86400');
    context.res.end(
      `function appendDiv() {
        const div = document.createElement('div');
        div.textContent = 'This div was appended by the script!';
        document.getElementById('asdddd').appendChild(div);
      }
  console.log("asdasd")
      // Run the function when the script is loaded
      appendDiv();`
    );
    return { props: {} };
  }
  
  export default Script;
  