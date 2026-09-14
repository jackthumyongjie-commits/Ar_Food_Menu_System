const box = document.getElementById('qr-card');
const url = box?.dataset.url || '';
const target = document.getElementById('qr');

if (target && url && window.QRCode) {
    new QRCode(target, {
        text: url,
        width: 180,
        height: 180,
        colorDark: '#071210',
        colorLight: '#eef8f4',
        correctLevel: QRCode.CorrectLevel.M
    });
}

document.getElementById('copy-link')?.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(url);
        const button = document.getElementById('copy-link');
        button.textContent = 'Copied';
        setTimeout(() => { button.textContent = 'Copy AR link'; }, 1400);
    } catch (error) {
        window.prompt('Copy this AR link:', url);
    }
});
