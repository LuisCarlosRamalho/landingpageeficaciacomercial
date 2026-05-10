document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('diagnosticForm');
    const steps = Array.from(document.querySelectorAll('.step'));
    const nextButtons = document.querySelectorAll('.btn-next');
    const backButtons = document.querySelectorAll('.back-step');
    const progressBar = document.getElementById('progressBar');
    const optionCards = document.querySelectorAll('.option-card');

    let currentStep = 0;

    function updateProgress() {
        const progress = ((currentStep) / (steps.length - 1)) * 100;
        progressBar.style.width = `${progress}%`;
    }

    function showStep(index) {
        steps.forEach((step, i) => {
            step.classList.toggle('active', i === index);
        });
        currentStep = index;
        updateProgress();

        // Focus first input of the step
        const firstInput = steps[currentStep].querySelector('input, textarea, select');
        if (firstInput) setTimeout(() => firstInput.focus(), 100);
    }

    function handleNext() {
        const currentStepEl = steps[currentStep];
        const inputs = currentStepEl.querySelectorAll('input[required], select[required], textarea[required]');
        
        let isValid = true;
        inputs.forEach(input => {
            if (!input.value) {
                isValid = false;
                input.style.borderBottomColor = '#ef4444';
            } else {
                input.style.borderBottomColor = '';
            }
        });

        if (isValid && currentStep < steps.length - 1) {
            showStep(currentStep + 1);
        }
    }

    nextButtons.forEach(button => {
        button.addEventListener('click', handleNext);
    });

    // Handle Enter Key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleNext();
        }
    });


    backButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (currentStep > 0) {
                showStep(currentStep - 1);
            }
        });
    });

    optionCards.forEach(card => {
        card.addEventListener('click', () => {
            const step = card.closest('.step');
            const hiddenInput = step.querySelector('input[type="hidden"]');
            
            // Unselect others in the same step
            step.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
            
            // Select this one
            card.classList.add('selected');
            hiddenInput.value = card.dataset.value;

            // Auto advance after short delay for better UX
            setTimeout(() => {
                if (currentStep < steps.length - 1) {
                    showStep(currentStep + 1);
                }
            }, 400);
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Em um cenário real, aqui você enviaria os dados via Fetch para um backend ou API.
        // Simulando envio:
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        console.log('Dados do Diagnóstico:', data);

        // Mostrar tela de sucesso
        showStep(steps.length - 1); // Penúltimo passo é o formulário, último é o sucesso
    });
});
