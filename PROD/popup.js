document
  .getElementById("testButton")
  .addEventListener("click", async function () {

    // Get context
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });


    const [spanVideoResult] = await chrome.scripting.executeScript({
      // needs context
      target: { tabId: tab.id },
      function: getSpanVideo,
    });
    const videoTitle = spanVideoResult.result;
    
    // Now that title of chapter is recorded when can open the transcript panel
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: clickTranscriptButton,
    });


    await new Promise((resolve) => setTimeout(resolve, 1000));

    const [spanDataResult] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: getSpanData,
    });

    const spanData = spanDataResult.result;

    console.log(spanData.length);
    console.log(videoTitle);

    fetch("https://nexlearn.vercel.app/api/loading/udemy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ spanData, videoTitle }),
      })
      .then((response) => {
        console.log("Response status:", response.status);
        return response.json();
      })
      .then((data) => {
        console.log("API response:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });

function clickTranscriptButton() {
  const transcriptButton = document.querySelector('button[data-purpose="transcript-toggle"]');
  if (transcriptButton) {
    transcriptButton.click();
  }
}

function getSpanData() {
  const selectSpans = document.querySelectorAll(
    'span[data-purpose="cue-text"]'
  );
  return Array.from(selectSpans).map((span) => span.textContent);
}

function getSpanVideo() {
  const selectedSpan = document.querySelector('li[aria-current="true"] span[data-purpose="item-title"]');
  if (selectedSpan) {
    return selectedSpan.textContent;
  }
  return null;
}
