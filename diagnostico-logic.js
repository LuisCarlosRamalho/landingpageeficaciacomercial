document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form');
    const steps = Array.from(document.querySelectorAll('.step'));
    const nextButtons = document.querySelectorAll('.btn-next');
    const backButtons = document.querySelectorAll('.back-step');
    const progressBar = document.getElementById('progressBar');
    const optionCards = document.querySelectorAll('.option-card');

    let currentStep = 0;
    let isTransitioning = false;

    function updateProgress() {
        const progress = ((currentStep) / (steps.length - 1)) * 100;
        if (progressBar) progressBar.style.width = `${progress}%`;
    }

    function typeWriter(element, text, speed = 20) {
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
        if (isTransitioning) return;
        isTransitioning = true;

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

            const firstInput = steps[currentStep].querySelector('input:not([type="hidden"]), textarea, select');
            if (firstInput) {
                setTimeout(() => {
                    firstInput.focus();
                    isTransitioning = false;
                }, 100);
            } else {
                isTransitioning = false;
            }
        }, currentActive ? 300 : 0);
    }

    async function handleSubmission() {
        const btnSubmit = form.querySelector('button[type="submit"]');
        const originalText = btnSubmit ? btnSubmit.innerHTML : 'Finalizar';
        
        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        }

        const formData = new FormData(form);
        
        const questionsMap = {
            "nome": "Nome Completo",
            "whatsapp": "WhatsApp",
            "email": "E-mail",
            "empresa": "Empresa",
            "colaboradores": "Quantidade de Colaboradores",
            "faturamento": "Faturamento Anual",
            "equipe_comercial": "Possui Equipe Comercial?",
            "tamanho_equipe": "Tamanho da Equipe Comercial",
            "socio_vende": "Sócio é o responsável pelas vendas?",
            "canais_captacao": "Canais de Captação",
            "ticket_medio": "Ticket Médio",
            "taxa_conversao": "Taxa de Conversão (%)",
            "processo_comercial": "Processo Comercial Documentado?",
            "pos_venda": "Faz Pós-Vendas?",
            "pesquisa_satisfacao": "Fez Pesquisa NPS?",
            "escala_urgencia": "Nível de Urgência (0-10)",
            "necessidade": "Maior Necessidade Atual"
        };

        let formattedMessage = "Novo Diagnóstico Recebido:\n\n";
        for (let [key, value] of formData.entries()) {
            if (questionsMap[key] && value) {
                formattedMessage += `${questionsMap[key]}: ${value}\n`;
            }
        }

        const finalData = new FormData();
        finalData.append("access_key", "99abc164-deac-4a9c-92bb-a741627986ac");
        finalData.append("subject", `Novo Diagnóstico: ${formData.get('nome')} - ${formData.get('empresa')}`);
        finalData.append("from_name", "Eficácia Comercial | Diagnóstico");
        finalData.append("message", formattedMessage);
        finalData.append("nome_cliente", formData.get('nome'));
        finalData.append("email_cliente", formData.get('email'));

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: finalData
            });

            const result = await response.json();

            if (result.success) {
                showStep(steps.length - 1);
                form.reset();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            alert("Erro ao enviar: " + error.message);
            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = originalText;
            }
        }
    }

    function handleNext() {
        if (isTransitioning) return;

        const currentStepEl = steps[currentStep];
        if (!currentStepEl || currentStepEl.id === 'successStep') return;

        // Validação manual: busca qualquer input (mesmo hidden) no passo atual
        const inputs = currentStepEl.querySelectorAll('input, select, textarea');
        
        let isValid = true;
        inputs.forEach(input => {
            // Ignora campos que não têm nome ou são chaves de acesso
            if (!input.name || input.name === 'access_key') return;

            if (!input.value) {
                isValid = false;
                if (input.type !== 'hidden') {
                    input.style.borderBottomColor = '#ef4444';
                    input.parentElement.style.animation = 'shake 0.4s ease';
                    setTimeout(() => input.parentElement.style.animation = '', 400);
                } else {
                    // Se for hidden (opções), balança o container das opções
                    const grid = currentStepEl.querySelector('.options-grid');
                    if (grid) {
                        grid.style.animation = 'shake 0.4s ease';
                        setTimeout(() => grid.style.animation = '', 400);
                    }
                }
            } else if (input.type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.value)) {
                    isValid = false;
                    input.style.borderBottomColor = '#ef4444';
                } else {
                    input.style.borderBottomColor = '';
                }
            } else {
                input.style.borderBottomColor = '';
            }
        });

        if (isValid) {
            if (currentStepEl.dataset.step === "15") {
                handleSubmission();
                return;
            }

            let nextIndex = currentStep + 1;

            if (currentStepEl.dataset.step === "7") {
                const equipe = document.getElementById('equipe_comercial').value;
                if (equipe === "Sim") {
                    nextIndex = steps.indexOf(document.getElementById('step_equipe_sim'));
                } else {
                    nextIndex = steps.indexOf(document.getElementById('step_equipe_nao'));
                }
            } else if (currentStepEl.dataset.step === "7.1" || currentStepEl.dataset.step === "7.2") {
                nextIndex = steps.findIndex(s => s.dataset.step === "8");
            }

            if (nextIndex < steps.length) {
                showStep(nextIndex);
            }
        }
    }

    form.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            if (e.target.tagName === 'TEXTAREA') return;
            e.preventDefault();
            handleNext();
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
    });

    nextButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            handleNext();
        });
    });

    backButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            if (isTransitioning) return;
            
            if (currentStep > 0) {
                let prevIndex = currentStep - 1;
                const currentStepEl = steps[currentStep];

                if (currentStepEl.dataset.step === "8") {
                    const equipe = document.getElementById('equipe_comercial').value;
                    if (equipe === "Sim") {
                        prevIndex = steps.indexOf(document.getElementById('step_equipe_sim'));
                    } else {
                        prevIndex = steps.indexOf(document.getElementById('step_equipe_nao'));
                    }
                } else if (currentStepEl.dataset.step === "7.1" || currentStepEl.dataset.step === "7.2") {
                    prevIndex = steps.findIndex(s => s.dataset.step === "7");
                }
                showStep(prevIndex);
            }
        });
    });

    optionCards.forEach(card => {
        card.addEventListener('click', () => {
            if (isTransitioning) return;
            
            const step = card.closest('.step');
            const isMulti = step.dataset.multi === "true";
            const hiddenInput = step.querySelector('input[type="hidden"]');
            
            if (isMulti) {
                card.classList.toggle('selected');
                const selected = Array.from(step.querySelectorAll('.option-card.selected'))
                                    .map(c => c.dataset.value);
                hiddenInput.value = selected.join(', ');
            } else {
                step.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                hiddenInput.value = card.dataset.value;
                
                setTimeout(() => {
                    handleNext();
                }, 300);
            }
        });
    });
});
