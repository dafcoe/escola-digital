const formElement = document.getElementById('report-generator-form') as HTMLFormElement;
const reportNameElement = document.getElementById('report-name') as HTMLInputElement;
const reportNameErrorElement = document.querySelector('label[for="report-name"] .error') as HTMLElement;
const reportNifsElement = document.getElementById('report-nifs') as HTMLInputElement;
const reportNifsErrorElement = document.querySelector('label[for="report-nifs"] .error') as HTMLElement;
const outputElement = document.getElementById('output') as HTMLPreElement;
const runButtonElement = document.getElementById('report-run-button') as HTMLButtonElement;
const spinnerElement = runButtonElement.querySelector('.spinner') as HTMLElement;
const downloadsElement = document.getElementById('report-downloads') as HTMLElement;
const downloadAnchorElement = document.getElementById('download-link') as HTMLAnchorElement;

function isReportNameValid() {
  return /^[a-zA-Z0-9_-]+$/.test(reportNameElement.value);
}

function isReportNameEmpty() {
  return reportNameElement.value.length === 0;
}

function isReportNifsValid() {
  return /^[0-9, ]+$/.test(reportNifsElement.value);
}

function isReportNifsEmpty() {
  return reportNifsElement.value.length === 0;
}

function updateSubmitButtonStatus() {
  runButtonElement.disabled = !isReportNameValid() || !isReportNifsValid();
}

reportNameElement.addEventListener('keyup', () => {
  updateSubmitButtonStatus();

  reportNameErrorElement.textContent = isReportNameEmpty() || isReportNameValid()
    ? ''
    : 'Invalid value: only letters, numbers, "_" and "-" are allowed';
});

reportNifsElement.addEventListener('keyup', () => {
  updateSubmitButtonStatus();

  reportNifsErrorElement.textContent = isReportNifsEmpty() || isReportNifsValid()
    ? ''
    : 'Invalid value: only numbers, commas and spaces are allowed';
});

formElement.addEventListener('submit', async (event) => {
  event.preventDefault();

  const reportName = reportNameElement.value;
  const reportNifs = reportNifsElement.value;

  outputElement.textContent = '';
  runButtonElement.disabled = true;
  spinnerElement.classList.remove('hidden');
  downloadsElement.classList.add('invisible');
  showToast('Report generation started');

  try {
    const response = await fetch('http://localhost:3000/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reportName, reportNifs }),
    });

    if (!response.ok || !response.body) {
      console.error('Failed to start scrapper');
      runButtonElement.disabled = false;
      spinnerElement.classList.add('hidden');
      showToast('An error occurred while generating the report', 'error');

      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const messages = buffer.split('\n');
      buffer = messages.pop() || '';

      messages.forEach((message) => {
        const messageChunks = message.split('\n');

        messageChunks.forEach((messageChunk) => {
          if (!messageChunk.includes('data:')) return;

          const messageData = messageChunk.split('data:')[1] || '';
          if (!messageData.trim().length) return;

          const messageDataLines = messageData.split('\n').filter((line) => line.trim().length > 0);
          const messageLogLastLine = ((outputElement.textContent?.split('\n') || []).filter((line) => line.trim().length > 0)).pop() || '';

          console.log({messageLogLastLine});

          messageDataLines.forEach((line, index) => {
            const previousIndex = index - 1;

            if (
              (
                previousIndex >= 0
                && line.includes('⚙️')
                && messageDataLines[previousIndex]?.includes('✅')
              ) || (
                previousIndex < 0
                && line.includes('⚙️')
                && messageLogLastLine.includes('✅')
              )
            ) {
              outputElement.textContent += '\n';
            }

            outputElement.textContent += `${line}\n`;
            outputElement.scrollTo({
              top: outputElement.scrollHeight,
              behavior: 'smooth',
            });
          });
        });
      });
    }

    runButtonElement.disabled = false;
    spinnerElement.classList.add('hidden');

    const reportFileName = `student-assignments-${reportNameElement.value}.xlsx`;
    downloadAnchorElement.href = `http://localhost:3000/static/${reportFileName}`;
    downloadAnchorElement.download = reportFileName;
    downloadAnchorElement.textContent = reportFileName;
    downloadsElement.classList.remove('invisible');
    downloadsElement.classList.add('visible');
    showToast('Report generation finished successfully', 'success');
  } catch (err) {
    outputElement.textContent = '❌ Error contacting backend';
    runButtonElement.disabled = false;
    spinnerElement.classList.add('hidden');
    showToast('An error occurred while generating the report', 'error');
    console.error(err);
  }
});

function showToast(message: string, type: 'success' | 'error' | 'info' = 'info', duration = 5000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const iconMap = {
    error: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-x-icon lucide-circle-x"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>',
    success: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check-icon lucide-circle-check"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>',
    info: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info-icon lucide-info"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `${iconMap[type]} ${message}`;

  const animationDuration = 400;
  const fadeOutDelay = duration - animationDuration;
  toast.style.animation = `slideIn ${animationDuration}ms ease, fadeOut 0.4s ease ${fadeOutDelay}ms forwards`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, duration);
}
