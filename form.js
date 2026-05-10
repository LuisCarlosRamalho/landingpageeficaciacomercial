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

    function typeWriter(element, text, speed = 30) {
        element.innerHTML = '';
        let i = 0;
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        type();
    }

    function showStep(index) {
        // Fade out current active step
        const currentActive = document.querySelector('.step.active');
        if (currentActive) {
            currentActive.style.opacity = '0';
            currentActive.style.transform = 'translateY(-20px)';
        }

        setTimeout(() => {
            steps.forEach((step, i) => {
                step.classList.toggle('active', i === index);
                if (i === index) {
                    step.style.opacity = '1';
                    step.style.transform = 'translateY(0)';
                    
                    // Typing effect for the question
                    const h2 = step.querySelector('h2');
                    if (h2 && !h2.dataset.typed) {
                        const originalText = h2.innerText;
                        typeWriter(h2, originalText);
                        h2.dataset.typed = "true";
                    }
                }
            });
            currentStep = index;
            updateProgress();

            // Focus first input of the step
            const firstInput = steps[currentStep].querySelector('input, textarea, select');
            if (firstInput) setTimeout(() => firstInput.focus(), 200);
        }, currentActive ? 300 : 0);
    }


    function handleNext() {
        const currentStepEl = steps[currentStep];
        const inputs = currentStepEl.querySelectorAll('input[required], select[required], textarea[required]');
        
        let isValid = true;
        inputs.forEach(input => {
            // Validação Básica (Preenchimento)
            if (!input.value) {
                isValid = false;
                input.style.borderBottomColor = '#ef4444';
                input.parentElement.style.animation = 'shake 0.4s ease';
                setTimeout(() => input.parentElement.style.animation = '', 400);
            } 
            // Validação E-mail
            else if (input.type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.value)) {
                    isValid = false;
                    input.style.borderBottomColor = '#ef4444';
                    input.parentElement.style.animation = 'shake 0.4s ease';
                    setTimeout(() => input.parentElement.style.animation = '', 400);
                } else {
                    input.style.borderBottomColor = '';
                }
            }
            else {
                input.style.borderBottomColor = '';
            }
        });

        if (isValid) {
            let nextIndex = currentStep + 1;

            // Lógica Condicional para Equipe Comercial (Passo 7)
            if (currentStepEl.dataset.step === "7") {
                const equipe = document.getElementById('equipe_comercial').value;
                if (equipe === "Sim") {
                    nextIndex = steps.indexOf(document.getElementById('step_equipe_sim'));
                } else {
                    nextIndex = steps.indexOf(document.getElementById('step_equipe_nao'));
                }
            } 
            // Pular o passo alternativo após responder o condicional (7.1 ou 7.2)
            else if (currentStepEl.dataset.step === "7.1" || currentStepEl.dataset.step === "7.2") {
                nextIndex = steps.findIndex(s => s.dataset.step === "8");
            }

            if (nextIndex < steps.length) {
                showStep(nextIndex);
            }
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
                let prevIndex = currentStep - 1;
                const currentStepEl = steps[currentStep];

                // Se estamos no passo 8, precisamos saber de onde viemos (7.1 ou 7.2)
                if (currentStepEl.dataset.step === "8") {
                    const equipe = document.getElementById('equipe_comercial').value;
                    if (equipe === "Sim") {
                        prevIndex = steps.indexOf(document.getElementById('step_equipe_sim'));
                    } else {
                        prevIndex = steps.indexOf(document.getElementById('step_equipe_nao'));
                    }
                }
                // Se estamos nos passos condicionais, voltamos para o 7
                else if (currentStepEl.dataset.step === "7.1" || currentStepEl.dataset.step === "7.2") {
                    prevIndex = steps.findIndex(s => s.dataset.step === "7");
                }

                showStep(prevIndex);
            }
        });
    });


    optionCards.forEach(card => {
        card.addEventListener('click', () => {
            const step = card.closest('.step');
            const isMulti = step.dataset.multi === "true";
            const hiddenInput = step.querySelector('input[type="hidden"]');
            
            if (isMulti) {
                // Toggle selection for multi-select
                card.classList.toggle('selected');
                
                // Get all selected values
                const selected = Array.from(step.querySelectorAll('.option-card.selected'))
                                    .map(c => c.dataset.value);
                hiddenInput.value = selected.join(', ');
            } else {
                // Single selection logic
                step.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                hiddenInput.value = card.dataset.value;

                // Auto advance after short delay
                setTimeout(() => {
                    handleNext();
                }, 400);
            }
        });
    });


    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btnSubmit = form.querySelector('button[type="submit"]');
        const originalText = btnSubmit.innerHTML;
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Mapeamento amigável das perguntas para o corpo do e-mail
        const questionsMap = {
            "nome": "Nome",
            "whatsapp": "WhatsApp",
            "email": "E-mail",
            "empresa": "Empresa",
            "colaboradores": "Quantidade de Colaboradores",
            "faturamento": "Faturamento Anual",
            "equipe_comercial": "Possui Equipe Comercial?",
            "tamanho_equipe": "Tamanho da Equipe",
            "socio_vende": "Sócio é o responsável pelas vendas?",
            "canais_captacao": "Canais de Captação",
            "ticket_medio": "Ticket Médio",
            "taxa_conversao": "Taxa de Conversão",
            "processo_comercial": "Processo Comercial Definido?",
            "pos_venda": "Faz Pós-Vendas?",
            "pesquisa_satisfacao": "Pesquisa de Satisfação?",
            "escala_urgencia": "Escala de Urgência (0-10)",
            "necessidade": "Maior Necessidade Comercial"
        };

        // Construir o corpo do e-mail no formato Pergunta: Resposta
        let emailBody = "";
        for (const [key, value] of Object.entries(data)) {
            const questionText = questionsMap[key] || key;
            if (value) {
                emailBody += `${questionText}: ${value}\n`;
            }
        }

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    access_key: "SUA_CHAVE_AQUI", // O usuário deve substituir pela chave recebida
                    subject: `Novo Diagnóstico: ${data.nome} - ${data.empresa}`,
                    from_name: "Diagnóstico Eficácia Comercial",
                    message: emailBody,
                    email: data.email // Permite responder direto ao lead
                })
            });

            const result = await response.json();

            if (result.success) {
                showStep(steps.length - 1); // Sucesso
            } else {
                alert('Erro ao enviar: ' + result.message);
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = originalText;
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro de conexão. Verifique sua internet.');
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = originalText;
        }
    });


});
