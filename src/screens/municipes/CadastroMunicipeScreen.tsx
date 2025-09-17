import React, { useState, useEffect } from "react";

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../constants/theme";
import { Municipe } from "../../types";
import { authService } from "../../services/auth";
import {
  getSupabaseHeadersFoto,
  getSupabaseHeaders,
  SUPABASE_ENDPOINTS,
} from "../../config/supabase";
import ChipTags from "../../components/ChipTags";
import MedicamentoSearch from "../../components/MedicamentoSearch";
import DoencaCronicaSearch from "../../components/DoencaCronicaSearch";
import PhotoUpload from "../../components/PhotoUpload";
import { ComboPicker } from "../../components/ComboPicker";
import { v4 as uuidv4 } from "uuid";
import { decode as atob } from "base-64";
import {
  formatCPF,
  formatRG,
  formatPhone,
  formatCEP,
  formatSUS,
  validateEmail,
  validateCPF,
  validateRG,
  validatePhone,
  validateSUS,
  formatDate,
  validateBirthDate,
  formatBirthDate,
} from "../../utils";

interface CadastroMunicipeForm {
  nomeCompleto: string;
  cpf: string;
  rg: string;
  dataNascimento: string;
  idade: number; // Campo calculado automaticamente
  estadoCivil: string;
  sexo: string;
  email: string;
  telefone: string;
  nomeMae: string;
  cep: string;
  rua: string;
  numero: string;
  complemento: string; // Campo complemento do endereço
  bairro: string;
  cidade: string;
  estado: string;
  // Dados de Saúde
  numeroSus: string;
  usoMedicamentoContinuo: string;
  quaisMedicamentos: string[]; // Array de strings para medicamentos
  deficiencia: string;
  necessitaAcompanhante: string;
  doencasCronicas: string[]; // Mudança: agora é array de strings para doenças crônicas
  observacoesMedicas: string; // Campo para observações médicas
  // Dados do Acompanhante
  acompanhanteNome: string;
  acompanhanteCpf: string;
  acompanhanteRg: string;
  acompanhanteDataNascimento: string;
  acompanhanteSexo: string;
  acompanhanteGrauParentesco: string;
  foto: string; // URL da foto
}

interface CadastroMunicipeScreenProps {
  onBack?: () => void;
  municipeToEdit?: Municipe;
  onSaveSuccess?: () => void; // Callback para invalidar cache após salvamento
}

export const CadastroMunicipeScreen = ({
  onBack,
  municipeToEdit,
  onSaveSuccess, // Adicionar o callback
}: CadastroMunicipeScreenProps) => {
  console.log("🔧 CadastroMunicipeScreen: Props recebidas", {
    hasOnBack: !!onBack,
    hasOnSaveSuccess: !!onSaveSuccess,
    hasMunicipeToEdit: !!municipeToEdit,
    municipeId: municipeToEdit?.id
  });

  const [activeTab, setActiveTab] = useState<"pessoais" | "saude">("pessoais");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showMedicamentoModal, setShowMedicamentoModal] = useState(false);
  const [showDeficienciaModal, setShowDeficienciaModal] = useState(false);
  const [showAcompanhanteModal, setShowAcompanhanteModal] = useState(false);
  const [showEstadoCivilModal, setShowEstadoCivilModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSexoModal, setShowSexoModal] = useState(false);
  const [showAcompanhanteSexoModal, setShowAcompanhanteSexoModal] =
    useState(false);
  const [loadingCEP, setLoadingCEP] = useState(false);

  // Estados para controle de validação e erros
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [showErrors, setShowErrors] = useState(false);

  const isEditMode = !!municipeToEdit;

  const [form, setForm] = useState<CadastroMunicipeForm>({
    nomeCompleto: "",
    cpf: "",
    rg: "",
    dataNascimento: "",
    idade: 0, // Campo calculado automaticamente
    estadoCivil: "",
    sexo: "",
    email: "",
    telefone: "",
    nomeMae: "",
    cep: "",
    rua: "",
    numero: "",
    complemento: "", // Campo complemento do endereço
    bairro: "",
    cidade: "",
    estado: "",
    // Dados de Saúde
    numeroSus: "",
    usoMedicamentoContinuo: "",
    quaisMedicamentos: [], // Array vazio para medicamentos
    deficiencia: "",
    necessitaAcompanhante: "",
    doencasCronicas: [], // Mudança: agora é array vazio para doenças crônicas
    observacoesMedicas: "", // Campo para observações médicas
    // Dados do Acompanhante
    acompanhanteNome: "",
    acompanhanteCpf: "",
    acompanhanteRg: "",
    acompanhanteDataNascimento: "",
    acompanhanteSexo: "",
    acompanhanteGrauParentesco: "",
    foto: "", // URL da foto
  });

  // Effect para carregar dados do munícipe quando estiver editando
  useEffect(() => {
    if (municipeToEdit) {
      // Função para calcular idade baseada na data de nascimento
      const calculateAge = (birthDate: string): number => {
        if (!birthDate) return 0;

        try {
          let date: Date;

          // Se for formato dd/MM/yyyy
          if (birthDate.includes("/")) {
            const [day, month, year] = birthDate.split("/").map(Number);
            date = new Date(year, month - 1, day);
          } else {
            // Se for formato ISO (yyyy-MM-dd)
            date = new Date(birthDate);
          }

          if (isNaN(date.getTime())) return 0;

          const today = new Date();
          let age = today.getFullYear() - date.getFullYear();
          const monthDiff = today.getMonth() - date.getMonth();

          if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < date.getDate())
          ) {
            age--;
          }

          return age >= 0 ? age : 0;
        } catch {
          return 0;
        }
      };

      // Função para formatar data para o formato dd/MM/yyyy
      const formatDateForInput = (dateString: string) => {
        try {
          if (!dateString) return "";
          const date = new Date(dateString);
          if (isNaN(date.getTime())) return "";

          const day = date.getDate().toString().padStart(2, "0");
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        } catch {
          return "";
        }
      };

      // Função para converter string de medicamentos em array
      const parseMedicamentos = (medicamentosString: string): string[] => {
        if (!medicamentosString || medicamentosString.trim() === "") return [];

        // Se for um JSON array, tentar fazer parse
        if (
          medicamentosString.startsWith("[") &&
          medicamentosString.endsWith("]")
        ) {
          try {
            return JSON.parse(medicamentosString);
          } catch {
            // Se falhar, tratar como string separada por vírgulas
            return medicamentosString
              .slice(1, -1)
              .split(",")
              .map((med) => med.trim())
              .filter((med) => med);
          }
        }

        // Tratar como string separada por vírgulas
        return medicamentosString
          .split(",")
          .map((med) => med.trim())
          .filter((med) => med);
      };

      // Função para converter string de doenças crônicas em array
      const parseDoencasCronicas = (doencasString: string): string[] => {
        if (!doencasString || doencasString.trim() === "") return [];

        // Se for um JSON array, tentar fazer parse
        if (doencasString.startsWith("[") && doencasString.endsWith("]")) {
          try {
            return JSON.parse(doencasString);
          } catch {
            // Se falhar, tratar como string separada por vírgulas
            return doencasString
              .slice(1, -1)
              .split(",")
              .map((doenca) => doenca.trim())
              .filter((doenca) => doenca);
          }
        }

        // Tratar como string separada por vírgulas
        return doencasString
          .split(",")
          .map((doenca) => doenca.trim())
          .filter((doenca) => doenca);
      };

      // Função para converter boolean para Sim/Não
      const convertBooleanToSimNao = (value: any): string => {
        if (value === true || value === "true" || value === 1 || value === "1")
          return "Sim";
        if (
          value === false ||
          value === "false" ||
          value === 0 ||
          value === "0"
        )
          return "Não";
        if (typeof value === "string" && value.toLowerCase().includes("sim"))
          return "Sim";
        if (typeof value === "string" && value.toLowerCase().includes("não"))
          return "Não";
        return value || "";
      };

      setForm({
        nomeCompleto: municipeToEdit.nome_completo || "",
        cpf: municipeToEdit.cpf || "",
        rg: municipeToEdit.rg || "",
        dataNascimento: formatDateForInput(municipeToEdit.data_nascimento),
        idade: calculateAge(municipeToEdit.data_nascimento || ""), // Calcular idade automaticamente
        estadoCivil: convertEstadoCivilFromDatabase(
          municipeToEdit.estado_civil || ""
        ),
        sexo: convertSexoFromDatabase(municipeToEdit.sexo || ""), // Converte M/F para Masculino/Feminino
        email: municipeToEdit.email || "",
        telefone: municipeToEdit.telefone || "",
        nomeMae: municipeToEdit.nome_mae || "",
        // Campos de endereço da view vw_municipes_completo
        cep: municipeToEdit.cep || "",
        rua: municipeToEdit.endereco || municipeToEdit.logradouro || "",
        numero: municipeToEdit.numero_endereco || municipeToEdit.numero || "",
        complemento:
          municipeToEdit.complemento_endereco ||
          municipeToEdit.complemento ||
          "", // Campo complemento
        bairro: municipeToEdit.bairro || "",
        cidade: municipeToEdit.cidade || "",
        estado: municipeToEdit.estado || municipeToEdit.uf || "", // Adicionando fallback para uf
        // Campos de saúde da view vw_municipes_completo
        numeroSus: municipeToEdit.cartao_sus || "",
        usoMedicamentoContinuo: convertBooleanToSimNao(
          municipeToEdit.uso_continuo_medicamentos ||
            municipeToEdit.uso_medicamento_continuo ||
            municipeToEdit.usa_medicamentos_continuos ||
            municipeToEdit.usoMedicamentoContinuo
        ),
        quaisMedicamentos: parseMedicamentos(
          municipeToEdit.quaisMedicamentos ||
            municipeToEdit.quais_medicamentos ||
            ""
        ), // Convertendo para array
        deficiencia: convertDeficienciaFromDatabase(
          municipeToEdit.deficiencia ||
            municipeToEdit.tem_deficiencia_fisica ||
            municipeToEdit.possui_deficiencia ||
            false
        ),
        necessitaAcompanhante: convertAcompanhanteFromDatabase(
          municipeToEdit.necessita_acompanhante || false
        ),
        doencasCronicas: parseDoencasCronicas(
          municipeToEdit.doencasCronicas ||
            municipeToEdit.doencas_cronicas ||
            municipeToEdit.doenca_cronica ||
            municipeToEdit.tipo_doenca ||
            ""
        ), // Convertendo para array
        observacoesMedicas: municipeToEdit.observacoes_medicas || "",
        // Dados do Acompanhante
        acompanhanteNome: municipeToEdit.acompanhante_nome || "",
        acompanhanteCpf: municipeToEdit.acompanhante_cpf || "",
        acompanhanteRg: municipeToEdit.acompanhante_rg || "",
        acompanhanteDataNascimento: formatDateForInput(
          municipeToEdit.acompanhante_data_nascimento || ""
        ),
        acompanhanteSexo: convertSexoFromDatabase(
          municipeToEdit.acompanhante_sexo || ""
        ),
        acompanhanteGrauParentesco:
          municipeToEdit.acompanhante_grau_parentesco || "",
        foto: municipeToEdit.foto_url || "", // Campo para foto
      });
    }
  }, [municipeToEdit]);

  const currentTheme = isDarkMode ? theme.dark : theme.light;

  // Opções para os selects
  const medicamentoOptions = ["Sim", "Não"];
  const deficienciaOptions = ["Sim", "Não"];
  const acompanhanteOptions = ["Sim", "Não"];
  const estadoCivilOptions = [
    "Solteiro",
    "Casado",
    "Divorciado",
    "Viúvo",
    "União Estável",
    "Separado",
  ];
  const sexoOptions = ["Feminino", "Masculino"];

  const updateForm = (
    field: keyof CadastroMunicipeForm,
    value: string | string[]
  ) => {
    setForm((prev: CadastroMunicipeForm) => ({ ...prev, [field]: value }));
  };

  // � Função para calcular idade baseada na data de nascimento
  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0;

    try {
      let date: Date;

      // Se for formato dd/MM/yyyy
      if (birthDate.includes("/")) {
        const [day, month, year] = birthDate.split("/").map(Number);
        date = new Date(year, month - 1, day);
      } else {
        // Se for formato ISO (yyyy-MM-dd)
        date = new Date(birthDate);
      }

      if (isNaN(date.getTime())) return 0;

      const today = new Date();
      let age = today.getFullYear() - date.getFullYear();
      const monthDiff = today.getMonth() - date.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < date.getDate())
      ) {
        age--;
      }

      return age >= 0 ? age : 0;
    } catch {
      return 0;
    }
  };

  // 🎂 Função específica para atualizar data de nascimento e calcular idade
  const updateBirthDate = (dateString: string) => {
    setForm((prev: CadastroMunicipeForm) => ({
      ...prev,
      dataNascimento: dateString,
      idade: calculateAge(dateString),
    }));
  };

  // �🎭 Funções para aplicar máscaras
  const updateCPF = (value: string) => {
    const formatted = formatCPF(value);
    updateForm("cpf", formatted);
  };

  const updateRG = (value: string) => {
    const formatted = formatRG(value);
    updateForm("rg", formatted);
  };

  const updatePhone = (value: string) => {
    const formatted = formatPhone(value);
    updateForm("telefone", formatted);
  };

  const updateSUS = (value: string) => {
    const formatted = formatSUS(value);
    updateForm("numeroSus", formatted);
  };

  // 🎯 Função para conversão de sexo para banco
  const convertSexoToDatabase = (sexo: string): string => {
    if (sexo === "Masculino") return "M";
    if (sexo === "Feminino") return "F";
    return sexo; // Se já estiver em formato M/F
  };

  // 🎯 Função para conversão de data dd/MM/yyyy para YYYY-MM-DD
  const convertDateToDatabase = (dateString: string): string => {
    if (!dateString) return "";

    // Se já estiver no formato YYYY-MM-DD, retorna como está
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    // Converte dd/MM/yyyy para YYYY-MM-DD
    const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateString.match(datePattern);

    if (match) {
      const [, day, month, year] = match;
      return `${year}-${month}-${day}`;
    }

    return dateString; // Retorna como está se não conseguir converter
  };

  // 🎯 Função para conversão de sexo do banco para exibição
  const convertSexoFromDatabase = (sexo: string): string => {
    if (sexo === "M") return "Masculino";
    if (sexo === "F") return "Feminino";
    return sexo; // Se já estiver em formato extenso
  };

  // 🎯 Função para conversão de acompanhante para banco
  const convertAcompanhanteToDatabase = (acompanhante: string): boolean => {
    return acompanhante === "Sim";
  };

  // 🎯 Função para conversão de acompanhante do banco para exibição
  const convertAcompanhanteFromDatabase = (
    acompanhante: boolean | string
  ): string => {
    if (typeof acompanhante === "boolean") {
      return acompanhante ? "Sim" : "Não";
    }
    if (acompanhante === "true" || acompanhante === "1") return "Sim";
    if (acompanhante === "false" || acompanhante === "0") return "Não";
    return acompanhante || "Não";
  };

  // 🎯 Função para conversão de estado civil para banco (formato sem acento)
  const convertEstadoCivilToDatabase = (estadoCivil: string): string => {
    const conversions: { [key: string]: string } = {
      Solteiro: "SOLTEIRO",
      Casado: "CASADO",
      Divorciado: "DIVORCIADO",
      Viúvo: "VIUVO",
      "União Estável": "UNIAO_ESTAVEL",
      Separado: "SEPARADO",
    };
    return conversions[estadoCivil] || estadoCivil;
  };

  // 🎯 Função para conversão de estado civil do banco para exibição (formato com acento)
  const convertEstadoCivilFromDatabase = (estadoCivil: string): string => {
    const conversions: { [key: string]: string } = {
      SOLTEIRO: "Solteiro",
      CASADO: "Casado",
      DIVORCIADO: "Divorciado",
      VIUVO: "Viúvo",
      UNIAO_ESTAVEL: "União Estável",
      SEPARADO: "Separado",
    };
    return conversions[estadoCivil] || estadoCivil;
  };

  // 🎯 Função para conversão de deficiência para banco
  const convertDeficienciaToDatabase = (deficiencia: string): boolean => {
    return deficiencia === "Sim";
  };

  // 🎯 Função para conversão de deficiência do banco para exibição
  const convertDeficienciaFromDatabase = (
    deficiencia: boolean | string
  ): string => {
    if (typeof deficiencia === "boolean") {
      return deficiencia ? "Sim" : "Não";
    }
    if (deficiencia === "true" || deficiencia === "1") return "Sim";
    if (deficiencia === "false" || deficiencia === "0") return "Não";
    return deficiencia || "Não";
  };

  // 💊 Funções para gerenciar medicamentos
  const adicionarMedicamento = (medicamento: string) => {
    const medicamentosAtuais = form.quaisMedicamentos;
    if (!medicamentosAtuais.includes(medicamento)) {
      updateForm("quaisMedicamentos", [...medicamentosAtuais, medicamento]);
    }
  };

  const removerMedicamento = (medicamento: string) => {
    const medicamentosAtuais = form.quaisMedicamentos;
    updateForm(
      "quaisMedicamentos",
      medicamentosAtuais.filter((med: string) => med !== medicamento)
    );
  };

  // 🩺 Funções para gerenciar doenças crônicas
  const adicionarDoencaCronica = (doenca: string) => {
    const doencasAtuais = form.doencasCronicas;
    if (!doencasAtuais.includes(doenca)) {
      updateForm("doencasCronicas", [...doencasAtuais, doenca]);
    }
  };

  const removerDoencaCronica = (doenca: string) => {
    const doencasAtuais = form.doencasCronicas;
    updateForm(
      "doencasCronicas",
      doencasAtuais.filter((d: string) => d !== doenca)
    );
  };

  const handleSelectOption = (
    field: keyof CadastroMunicipeForm,
    value: string
  ) => {
    updateForm(field, value);

    // Limpar erro do campo selecionado
    clearFieldError(field as string);

    // Limpar campo de medicamentos se mudar para "Não"
    if (field === "usoMedicamentoContinuo" && value === "Não") {
      updateForm("quaisMedicamentos", []); // Agora limpa com array vazio
    }

    // Limpar dados do acompanhante se mudar para "Não"
    if (field === "necessitaAcompanhante" && value === "Não") {
      updateForm("acompanhanteNome", "");
      updateForm("acompanhanteCpf", "");
      updateForm("acompanhanteRg", "");
      updateForm("acompanhanteDataNascimento", "");
      updateForm("acompanhanteSexo", "");
      updateForm("acompanhanteGrauParentesco", "");
    }

    // Fechar todos os modais
    setShowMedicamentoModal(false);
    setShowDeficienciaModal(false);
    setShowAcompanhanteModal(false);
    setShowEstadoCivilModal(false);
    setShowSexoModal(false);
    setShowAcompanhanteSexoModal(false);
  };

  // 📍 Função para aplicar máscara de CEP
  const aplicarMascaraCEP = (valor: string): string => {
    // Remove tudo que não é número
    const somenteNumeros = valor.replace(/\D/g, "");

    // Aplica a máscara 00000-000
    if (somenteNumeros.length <= 5) {
      return somenteNumeros;
    } else {
      return `${somenteNumeros.slice(0, 5)}-${somenteNumeros.slice(5, 8)}`;
    }
  };

  // 📍 Função para atualizar CEP com máscara
  const handleCEPChange = (valor: string) => {
    const cepComMascara = aplicarMascaraCEP(valor);
    updateForm("cep", cepComMascara);
  };

  const buscarCEP = async () => {
    const cepSomenteNumeros = form.cep.replace(/\D/g, "");

    if (cepSomenteNumeros.length === 8) {
      setLoadingCEP(true);
      try {
        console.log("🔍 Buscando CEP:", cepSomenteNumeros);
        const response = await fetch(
          `https://viacep.com.br/ws/${cepSomenteNumeros}/json/`
        );

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        if (data.erro) {
          console.warn("⚠️ CEP não encontrado:", cepSomenteNumeros);
          alert("CEP não encontrado. Verifique o CEP digitado.");
          return;
        }

        // Preencher automaticamente os campos de endereço
        updateForm("rua", data.logradouro || "");
        updateForm("bairro", data.bairro || "");
        updateForm("cidade", data.localidade || "");
        updateForm("estado", data.uf || "");
      } catch (error) {
        console.error("❌ Erro ao buscar CEP:", error);
        alert("Erro ao buscar CEP. Verifique sua conexão e tente novamente.");
      } finally {
        setLoadingCEP(false);
      }
    } else {
      alert("Digite um CEP válido com 8 dígitos.");
    }
  };

  // � Função para validar todos os campos e retornar erros
  const validateAllFields = (): { [key: string]: string } => {
    const errors: { [key: string]: string } = {};

    // ✅ CAMPOS OBRIGATÓRIOS - DADOS PESSOAIS
    if (!form.nomeCompleto.trim()) {
      errors.nomeCompleto = "Nome completo é obrigatório";
    }

    if (!form.cpf.trim()) {
      errors.cpf = "CPF é obrigatório";
    } else if (!validateCPF(form.cpf)) {
      errors.cpf = "CPF inválido. Verifique os números digitados";
    }

    if (!form.rg.trim()) {
      errors.rg = "RG é obrigatório";
    } else if (!validateRG(form.rg)) {
      errors.rg = "RG inválido. Deve ter entre 7 e 12 caracteres";
    }

    if (!form.dataNascimento.trim()) {
      errors.dataNascimento = "Data de nascimento é obrigatória";
    } else if (!validateBirthDate(form.dataNascimento)) {
      errors.dataNascimento =
        "Data inválida. Use formato dd/MM/yyyy e data no passado";
    }

    if (!form.sexo.trim()) {
      errors.sexo = "Sexo é obrigatório";
    }

    if (!form.email.trim()) {
      errors.email = "E-mail é obrigatório";
    } else if (!validateEmail(form.email)) {
      errors.email = "E-mail inválido. Verifique o formato (exemplo@email.com)";
    }

    if (!form.telefone.trim()) {
      errors.telefone = "Telefone é obrigatório";
    } else if (!validatePhone(form.telefone)) {
      errors.telefone = "Telefone inválido. Use o formato (XX) XXXXX-XXXX";
    }

    if (!form.nomeMae.trim()) {
      errors.nomeMae = "Nome da mãe é obrigatório";
    }

    if (!form.estadoCivil.trim()) {
      errors.estadoCivil = "Estado civil é obrigatório";
    }

    // ✅ CAMPOS OBRIGATÓRIOS - ENDEREÇO
    if (!form.cep.trim()) {
      errors.cep = "CEP é obrigatório";
    }

    if (!form.rua.trim()) {
      errors.rua = "Rua é obrigatória";
    }

    if (!form.numero.trim()) {
      errors.numero = "Número é obrigatório";
    }

    if (!form.bairro.trim()) {
      errors.bairro = "Bairro é obrigatório";
    }

    if (!form.cidade.trim()) {
      errors.cidade = "Cidade é obrigatória";
    }

    if (!form.estado.trim()) {
      errors.estado = "Estado é obrigatório";
    }

    // ✅ CAMPOS OBRIGATÓRIOS - SAÚDE
    if (!form.numeroSus.trim()) {
      errors.numeroSus = "Número do SUS é obrigatório";
    } else if (!validateSUS(form.numeroSus)) {
      errors.numeroSus = "Número do SUS inválido. Deve conter 15 dígitos";
    }

    if (!form.usoMedicamentoContinuo.trim()) {
      errors.usoMedicamentoContinuo =
        "Informe se faz uso contínuo de medicamentos";
    }

    if (!form.deficiencia.trim()) {
      errors.deficiencia = "Informe se possui deficiência";
    }

    if (!form.necessitaAcompanhante.trim()) {
      errors.necessitaAcompanhante = "Informe se necessita de acompanhante";
    }

    // 🔄 VALIDAÇÃO CONDICIONAL - obrigatório apenas se uso de medicamento for "Sim"
    if (
      form.usoMedicamentoContinuo === "Sim" &&
      form.quaisMedicamentos.length === 0
    ) {
      errors.quaisMedicamentos =
        'Selecione pelo menos um medicamento quando uso contínuo for "Sim"';
    }

    // ✅ VALIDAÇÃO CONDICIONAL - ACOMPANHANTE (apenas se necessitaAcompanhante for "Sim")
    if (form.necessitaAcompanhante === "Sim") {
      if (!form.acompanhanteNome.trim()) {
        errors.acompanhanteNome = "Nome do acompanhante é obrigatório";
      }

      if (!form.acompanhanteCpf.trim()) {
        errors.acompanhanteCpf = "CPF do acompanhante é obrigatório";
      } else if (!validateCPF(form.acompanhanteCpf)) {
        errors.acompanhanteCpf = "CPF do acompanhante inválido";
      }

      if (!form.acompanhanteRg.trim()) {
        errors.acompanhanteRg = "RG do acompanhante é obrigatório";
      } else if (!validateRG(form.acompanhanteRg)) {
        errors.acompanhanteRg =
          "RG do acompanhante inválido. Deve ter entre 7 e 12 caracteres";
      }

      if (!form.acompanhanteDataNascimento.trim()) {
        errors.acompanhanteDataNascimento =
          "Data de nascimento do acompanhante é obrigatória";
      } else if (!validateBirthDate(form.acompanhanteDataNascimento)) {
        errors.acompanhanteDataNascimento =
          "Data inválida. Use formato dd/MM/yyyy e data no passado";
      }

      if (!form.acompanhanteSexo.trim()) {
        errors.acompanhanteSexo = "Sexo do acompanhante é obrigatório";
      }

      if (!form.acompanhanteGrauParentesco.trim()) {
        errors.acompanhanteGrauParentesco = "Grau de parentesco é obrigatório";
      }
    }

    return errors;
  };

  // 🎯 Função para limpar erro de um campo específico
  const clearFieldError = (fieldName: string) => {
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  // 🔄 Função updateForm modificada para limpar erros
  const updateFormAndClearError = (
    field: keyof CadastroMunicipeForm,
    value: string | string[]
  ) => {
    updateForm(field, value);
    clearFieldError(field as string);
  };

  // �💾 Função para criar novo munícipe
  const criarMunicipe = async () => {
    try {
      // Obter access_token do auth-simple
      const accessToken = authService.getAccessToken();

      if (!accessToken) {
        throw new Error(
          "Token de acesso não encontrado. Usuário não autenticado."
        );
      }
      const newId = uuidv4();

      const dataUrl = form.foto; // sua string
      if (hasBase64DataUrl(dataUrl)) {
        const match = dataUrl.match(/^data:(.*);base64,/);
        if (!match) throw new Error("Formato de imagem inválido");
        const mime = match[1];
        const base64 = dataUrl.split(",")[1];

        // Decodifica Base64 -> bytes
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

        // Fazer chamada direta à API para salvar foto
        const responseStorage = await fetch(
          `${SUPABASE_ENDPOINTS.storage}/object/avatars/municipes/${newId}/avatar.jpg`,
          {
            method: "POST",
            headers: getSupabaseHeadersFoto(accessToken, mime),
            body: bytes,
          }
        );

        if (!responseStorage.ok) {
          const errorData = await responseStorage.text();
          throw new Error(`HTTP Error ${responseStorage.status}: ${errorData}`);
        }
      }

      const parametros = {
        p_municipe_id: newId,
        p_bairro: form.bairro || "",
        p_cartao_sus: form.numeroSus.replace(/\s/g, "") || "", // Remove espaços do SUS
        p_cep: form.cep.replace(/\D/g, "") || "", // Remove máscara do CEP
        p_cidade: form.cidade || "",
        p_complemento: form.complemento || "", // Campo complemento do formulário
        p_cpf: form.cpf.replace(/\D/g, "") || "", // Remove máscara do CPF
        p_data_nascimento: convertDateToDatabase(form.dataNascimento) || "",
        p_doenca_cronica: form.doencasCronicas.join(", ") || "", // Array para string
        p_email: form.email || "",
        p_estado_civil: convertEstadoCivilToDatabase(form.estadoCivil) || "",
        p_foto_url: !form.foto
          ? ""
          : `${SUPABASE_ENDPOINTS.storage}/object/public/avatars/municipes/${newId}/avatar.jpg`, // URL da foto após upload
        p_logradouro: form.rua || "",
        p_necessita_acompanhante: convertAcompanhanteToDatabase(
          form.necessitaAcompanhante
        ), // Converte para true/false
        p_nome_completo: form.nomeCompleto || "",
        p_nome_mae: form.nomeMae || "",
        p_numero: form.numero || "",
        p_observacoes: "", // Campo não presente no form atual
        p_observacoes_medicas: form.observacoesMedicas || "", // Campo de observações médicas
        p_quais_medicamentos: form.quaisMedicamentos.join(", ") || "", // Array para string
        p_ref_zona_rural: false,
        p_rg: form.rg || "",
        p_sexo: convertSexoToDatabase(form.sexo), // Converte para M/F
        p_telefone: form.telefone || "",
        p_tem_deficiencia_fisica: convertDeficienciaToDatabase(
          form.deficiencia
        ),
        p_tipo_doenca: "",
        p_uf: form.estado || "",
        p_uso_continuo_medicamentos: form.usoMedicamentoContinuo === "Sim",
        p_zona_rural: false,
        // Parâmetros do acompanhante (condicionais)
        ...(form.necessitaAcompanhante === "Sim" &&
          form.acompanhanteNome.trim() && {
            p_acompanhante_nome: form.acompanhanteNome || "",
            p_acompanhante_cpf: form.acompanhanteCpf.replace(/\D/g, "") || "",
            p_acompanhante_rg: form.acompanhanteRg || "",
            p_acompanhante_data_nascimento:
              convertDateToDatabase(form.acompanhanteDataNascimento) || null,
            p_acompanhante_sexo:
              convertSexoToDatabase(form.acompanhanteSexo) || "",
            p_acompanhante_grau_parentesco:
              form.acompanhanteGrauParentesco || "",
          }),
      };

      // Fazer chamada direta à API usando fetch com access_token correto
      const response = await fetch(
        `${SUPABASE_ENDPOINTS.rest}/rpc/rpc_criar_municipe_completo`,
        {
          method: "POST",
          headers: getSupabaseHeaders(accessToken),
          body: JSON.stringify(parametros),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP Error ${response.status}: ${errorData}`);
      }

      const data = await response.json();

      return data;
    } catch (error) {
      throw error;
    }
  };

  function hasBase64DataUrl(s: unknown): s is string {
    return typeof s === "string" && /^data:[^;]+;base64,/.test(s);
  }

  // 🔄 Função para atualizar munícipe existente
  const atualizarMunicipe = async () => {
    console.log("🔄 atualizarMunicipe: Iniciando atualização...");

    try {
      console.log("📝 Verificando ID do munícipe...");

      if (!municipeToEdit?.id) {
        throw new Error("ID do munícipe não encontrado para atualização");
      }

      console.log("🔑 ID do munícipe encontrado:", municipeToEdit.id);

      // Obter access_token do auth-simple
      const accessToken = authService.getAccessToken();
      console.log("🔐 Access token obtido:", accessToken ? "Sim" : "Não");

      if (!accessToken) {
        throw new Error(
          "Token de acesso não encontrado. Usuário não autenticado."
        );
      }

      console.log("📸 Verificando foto...");

      const dataUrl = form.foto; // sua string
      if (hasBase64DataUrl(dataUrl)) {
        console.log("📷 Processando upload de foto...");
        const match = dataUrl.match(/^data:(.*);base64,/);
        if (!match) throw new Error("Formato de imagem inválido");
        const mime = match[1];
        const base64 = dataUrl.split(",")[1];

        // Decodifica Base64 -> bytes
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

        console.log("☁️ Fazendo upload da foto...");
        // Fazer chamada direta à API para salvar foto
        const responseStorage = await fetch(
          `${SUPABASE_ENDPOINTS.storage}/object/avatars/municipes/${municipeToEdit?.id}/avatar.jpg`,
          {
            method: "POST",
            headers: getSupabaseHeadersFoto(accessToken, mime),
            body: bytes,
          }
        );

        if (!responseStorage.ok) {
          const errorData = await responseStorage.text();
          throw new Error(`HTTP Error ${responseStorage.status}: ${errorData}`);
        }

        const dataFoto = await responseStorage.json();
        console.log("✅ Foto enviada com sucesso");
      } else {
        console.log("📷 Nenhuma foto nova para fazer upload");
      }

      console.log("📋 Preparando parâmetros para atualização...");

      const parametros = {
        p_bairro: form.bairro || "",
        p_cartao_sus: form.numeroSus.replace(/\s/g, "") || "", // Remove espaços do SUS
        p_cep: form.cep.replace(/\D/g, "") || "", // Remove máscara do CEP
        p_cidade: form.cidade || "",
        p_complemento: form.complemento || "", // Campo complemento do formulário
        p_data_nascimento: convertDateToDatabase(form.dataNascimento) || "",
        p_doenca_cronica: form.doencasCronicas.join(", ") || "", // Array para string
        p_email: form.email || "",
        p_estado_civil: convertEstadoCivilToDatabase(form.estadoCivil) || "",
        p_foto_url: !form.foto
          ? ""
          : `${SUPABASE_ENDPOINTS.storage}/object/public/avatars/municipes/${municipeToEdit?.id}/avatar.jpg`, // Campo não presente no form atual // Campo não presente no form atual
        p_logradouro: form.rua || "",
        p_municipe_id: municipeToEdit.id, // ID para atualização
        p_necessita_acompanhante: convertAcompanhanteToDatabase(
          form.necessitaAcompanhante
        ), // Converte para true/false
        p_nome_completo: form.nomeCompleto || "",
        p_nome_mae: form.nomeMae || "",
        p_numero: form.numero || "",
        p_observacoes: "", // Campo não presente no form atual
        p_observacoes_medicas: form.observacoesMedicas || "", // Campo de observações médicas
        p_quais_medicamentos: form.quaisMedicamentos.join(", ") || "", // Array para string
        p_ref_zona_rural: false,
        p_rg: form.rg || "",
        p_sexo: convertSexoToDatabase(form.sexo), // Converte para M/F
        p_telefone: form.telefone || "",
        p_tem_deficiencia_fisica: convertDeficienciaToDatabase(
          form.deficiencia
        ),
        p_tipo_doenca: "",
        p_uf: form.estado || "",
        p_uso_continuo_medicamentos: form.usoMedicamentoContinuo === "Sim",
        p_zona_rural: false,
        // Parâmetros do acompanhante
        ...(form.necessitaAcompanhante === "Sim" && form.acompanhanteNome.trim()
          ? {
              p_acompanhante_nome: form.acompanhanteNome || "",
              p_acompanhante_cpf: form.acompanhanteCpf.replace(/\D/g, "") || "",
              p_acompanhante_rg: form.acompanhanteRg || "",
              p_acompanhante_data_nascimento:
                convertDateToDatabase(form.acompanhanteDataNascimento) || null,
              p_acompanhante_sexo:
                convertSexoToDatabase(form.acompanhanteSexo) || "",
              p_acompanhante_grau_parentesco:
                form.acompanhanteGrauParentesco || "",
            }
          : {
              p_remover_acompanhante: form.necessitaAcompanhante === "Não",
            }),
      };

      console.log("🌐 Fazendo chamada à API para atualizar...");

      // Fazer chamada direta à API usando fetch com access_token correto
      const response = await fetch(
        `${SUPABASE_ENDPOINTS.rest}/rpc/rpc_atualizar_municipe_completo`,
        {
          method: "POST",
          headers: getSupabaseHeaders(accessToken),
          body: JSON.stringify(parametros),
        }
      );

      console.log("📡 Resposta da API recebida. Status:", response.status);

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP Error ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      console.log("✅ Dados atualizados com sucesso no backend");

      return data;
    } catch (error) {
      console.error("💥 Erro na atualização do munícipe:", error);

      // Log detalhado do erro
      if (error instanceof Error) {
        console.error("📋 Mensagem do erro:", error.message);
        console.error("📚 Stack trace:", error.stack);
      } else {
        console.error("❓ Erro desconhecido:", error);
      }

      throw error;
    }
  };

  const handleSalvar = async () => {
    console.log("🔄 handleSalvar: Iniciando função de salvamento...");
    console.log("🔍 isEditMode:", isEditMode);

    // Limpar erros anteriores
    setFieldErrors({});
    setIsLoading(true);

    // Executar validação completa
    const errors = validateAllFields();
    console.log(
      "✅ Validação completa:",
      Object.keys(errors).length === 0
        ? "Sem erros"
        : `${Object.keys(errors).length} erros encontrados`
    );

    if (Object.keys(errors).length > 0) {
      setIsLoading(false);
      // Mostrar erros no formulário
      setFieldErrors(errors);

      // Encontrar primeiro campo com erro para navegar até a aba correta
      const firstErrorField = Object.keys(errors)[0];
      const healthFields = [
        "numeroSus",
        "usoMedicamentoContinuo",
        "quaisMedicamentos",
        "doencasCronicas",
        "acompanhanteNome",
        "acompanhanteCpf",
        "acompanhanteRg",
        "acompanhanteDataNascimento",
        "acompanhanteSexo",
        "acompanhanteGrauParentesco",
      ];

      // Determinar qual aba contém o erro
      const targetTab = healthFields.includes(firstErrorField)
        ? "saude"
        : "pessoais";

      // Navegar para a aba com erro
      setActiveTab(targetTab);

      // Mostrar alerta com resumo dos erros
      const errorCount = Object.keys(errors).length;
      const errorFields = Object.keys(errors).join(", ");
      Alert.alert(
        "Dados incompletos",
        `Encontrei ${errorCount} erro(s) nos campos: ${errorFields}.\n\nOs campos com erro estão destacados em vermelho.`
      );
      return;
    }

    try {
      console.log("💾 Iniciando processo de salvamento...");

      let resultado;

      if (isEditMode) {
        console.log("✏️ Modo edição - atualizando munícipe existente...");
        resultado = await atualizarMunicipe();
        console.log("✅ atualizarMunicipe concluída com sucesso!", resultado);
      } else {
        console.log("➕ Modo criação - criando novo munícipe...");
        resultado = await criarMunicipe();
        console.log("✅ criarMunicipe concluída com sucesso!", resultado);
      }

      console.log(
        "🎉 Salvamento concluído - preparando mensagem de sucesso..."
      );

      // ✅ CHAMAR CALLBACK PARA INVALIDAR CACHE IMEDIATAMENTE APÓS SALVAMENTO
      console.log("🔄 Verificando se onSaveSuccess foi fornecido...");
      if (onSaveSuccess) {
        console.log("🔄 onSaveSuccess encontrado! Executando callback...");
        try {
          await onSaveSuccess(); // Aguardar execução do callback
          console.log("✅ onSaveSuccess executado com sucesso - lista foi atualizada");
        } catch (error) {
          console.error("❌ Erro ao executar onSaveSuccess:", error);
        }
      } else {
        console.log("⚠️ onSaveSuccess NÃO foi fornecido - lista não será atualizada automaticamente");
        console.log("⚠️ Props recebidas:", { onBack: !!onBack, municipeToEdit: !!municipeToEdit, onSaveSuccess: !!onSaveSuccess });
      }

      // Usar modal personalizado ao invés de Alert
      setIsLoading(false);
      setSuccessMessage(
        isEditMode
          ? "Dados atualizados com sucesso!"
          : "Cadastro salvo com sucesso!"
      );
      setShowSuccessModal(true);
    } catch (error) {
      console.error("❌ Erro ao salvar munícipe:", error);
      setIsLoading(false);

      const mensagemErro = isEditMode
        ? "Erro ao atualizar munícipe. Tente novamente."
        : "Erro ao cadastrar munícipe. Tente novamente.";

      Alert.alert("Erro", mensagemErro);
    }
  };

  const handleCancelar = () => {
    // Tentar ir direto sem Alert para testar
    if (onBack) {
      onBack();
    } else {
    }
  };

  // 🎨 Componente para mostrar erro de campo
  const FieldError = ({ error }: { error?: string }) => {
    if (!error) return null;
    return (
      <Text
        style={{
          color: "#e74c3c",
          fontSize: 12,
          marginTop: 4,
          marginLeft: 4,
        }}
      >
        {error}
      </Text>
    );
  };

  // 🎨 Função para obter estilo de campo com erro
  const getFieldStyle = (fieldName: string, baseStyle: any) => {
    const hasError = fieldErrors[fieldName];
    return {
      ...baseStyle,
      borderColor: hasError ? "#e74c3c" : baseStyle.borderColor,
      borderWidth: hasError ? 2 : baseStyle.borderWidth || 1,
    };
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: currentTheme.background }]}
    >
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: currentTheme.text }]}>
            {isEditMode ? "Editar Munícipe" : "Cadastro de Munícipe"}
          </Text>
        </View>

        {/* Tabs */}
        <View
          style={[
            styles.tabContainer,
            { borderBottomColor: currentTheme.border },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "pessoais" && styles.activeTab,
              activeTab === "pessoais" && { borderBottomColor: "#8A9E8E" },
            ]}
            onPress={() => setActiveTab("pessoais")}
          >
            <Ionicons
              name="person"
              size={20}
              color={
                activeTab === "pessoais"
                  ? "#8A9E8E"
                  : currentTheme.mutedForeground
              }
            />
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === "pessoais"
                      ? "#8A9E8E"
                      : currentTheme.mutedForeground,
                },
              ]}
            >
              Dados Pessoais
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "saude" && styles.activeTab,
              activeTab === "saude" && { borderBottomColor: "#8A9E8E" },
            ]}
            onPress={() => setActiveTab("saude")}
          >
            <Ionicons
              name="medical"
              size={20}
              color={
                activeTab === "saude" ? "#8A9E8E" : currentTheme.mutedForeground
              }
            />
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === "saude"
                      ? "#8A9E8E"
                      : currentTheme.mutedForeground,
                },
              ]}
            >
              Dados de Saúde
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        {activeTab === "pessoais" && (
          <View style={styles.formContainer}>
            {/* Layout com foto à esquerda e campos à direita */}
            <View style={styles.photoAndBasicInfo}>
              {/* Foto do Munícipe à esquerda */}
              <View style={styles.photoSection}>
                <PhotoUpload
                  currentPhoto={form.foto}
                  onPhotoSelected={(uri: string) => updateForm("foto", uri)}
                  label="Foto do Munícipe"
                />
              </View>

              {/* Informações básicas à direita */}
              <View style={styles.basicInfoSection}>
                {/* Nome Completo */}
                <View style={styles.fullWidth}>
                  <Text style={[styles.label, { color: currentTheme.text }]}>
                    Nome Completo *
                  </Text>
                  <TextInput
                    style={[
                      getFieldStyle("nomeCompleto", {
                        ...styles.input,
                        backgroundColor: currentTheme.surface,
                        borderColor: currentTheme.border,
                        color: currentTheme.text,
                      }),
                    ]}
                    placeholder="Digite o nome completo"
                    placeholderTextColor={currentTheme.mutedForeground}
                    value={form.nomeCompleto}
                    onChangeText={(value: string) =>
                      updateFormAndClearError("nomeCompleto", value)
                    }
                  />
                  <FieldError error={fieldErrors.nomeCompleto} />
                </View>

                {/* CPF e RG na mesma linha */}
                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <Text style={[styles.label, { color: currentTheme.text }]}>
                      CPF *
                    </Text>
                    <TextInput
                      style={[
                        getFieldStyle("cpf", {
                          ...styles.input,
                          backgroundColor: currentTheme.surface,
                          borderColor: currentTheme.border,
                          color: currentTheme.text,
                        }),
                      ]}
                      placeholder="000.000.000-00"
                      placeholderTextColor={currentTheme.mutedForeground}
                      value={form.cpf}
                      onChangeText={(value: string) => {
                        updateCPF(value);
                        clearFieldError("cpf");
                      }}
                      keyboardType="numeric"
                      maxLength={14} // 11 dígitos + 3 caracteres de máscara
                    />
                    <FieldError error={fieldErrors.cpf} />
                  </View>

                  <View style={styles.halfWidth}>
                    <Text style={[styles.label, { color: currentTheme.text }]}>
                      RG *
                    </Text>
                    <TextInput
                      style={[
                        getFieldStyle("rg", {
                          ...styles.input,
                          backgroundColor: currentTheme.surface,
                          borderColor: currentTheme.border,
                          color: currentTheme.text,
                        }),
                      ]}
                      placeholder="00.000.000-0"
                      placeholderTextColor={currentTheme.mutedForeground}
                      value={form.rg}
                      onChangeText={(value: string) => {
                        updateRG(value);
                        clearFieldError("rg");
                      }}
                      maxLength={12} // 9 dígitos + 3 caracteres de máscara
                    />
                    <FieldError error={fieldErrors.rg} />
                  </View>
                </View>
              </View>
            </View>

            {/* Resto dos campos */}
            {/* Data de Nascimento, Idade e Sexo */}
            <View style={styles.row}>
              <View style={styles.thirdWidth}>
                <Text style={[styles.label, { color: currentTheme.text }]}>
                  Data de Nascimento *
                </Text>
                <TextInput
                  style={[
                    getFieldStyle("dataNascimento", {
                      ...styles.input,
                      backgroundColor: currentTheme.surface,
                      borderColor: currentTheme.border,
                      color: currentTheme.text,
                    }),
                  ]}
                  placeholder="dd/MM/yyyy"
                  placeholderTextColor={currentTheme.mutedForeground}
                  value={form.dataNascimento}
                  onChangeText={(value: string) => {
                    const formatted = formatBirthDate(value);
                    updateBirthDate(formatted); // Usar a nova função que calcula idade
                    clearFieldError("dataNascimento");
                  }}
                  keyboardType="numeric"
                  maxLength={10} // dd/MM/yyyy
                />
                <FieldError error={fieldErrors.dataNascimento} />
              </View>

              <View style={styles.thirdWidth}>
                <Text style={[styles.label, { color: currentTheme.text }]}>
                  Idade
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: currentTheme.muted,
                      borderColor: currentTheme.border,
                      color: currentTheme.mutedForeground,
                    },
                  ]}
                  value={form.idade > 0 ? `${form.idade} anos` : ""}
                  placeholder="Calculado automaticamente"
                  placeholderTextColor={currentTheme.mutedForeground}
                  editable={false} // Campo não editável
                />
              </View>

              <View style={styles.thirdWidth}>
                <Text style={[styles.label, { color: currentTheme.text }]}>
                  Sexo *
                </Text>
                <TouchableOpacity
                  style={[
                    getFieldStyle("sexo", {
                      ...styles.selectContainer,
                      backgroundColor: currentTheme.surface,
                      borderColor: currentTheme.border,
                    }),
                  ]}
                  onPress={() => setShowSexoModal(true)}
                >
                  <Text
                    style={[
                      styles.selectText,
                      {
                        color: form.sexo
                          ? currentTheme.text
                          : currentTheme.mutedForeground,
                      },
                    ]}
                  >
                    {form.sexo || "Selecione o sexo"}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={16}
                    color={currentTheme.mutedForeground}
                  />
                </TouchableOpacity>
                <FieldError error={fieldErrors.sexo} />
              </View>
            </View>

            {/* E-mail e Estado Civil */}
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={[styles.label, { color: currentTheme.text }]}>
                  E-mail *
                </Text>
                <TextInput
                  style={[
                    getFieldStyle("email", {
                      ...styles.input,
                      backgroundColor: currentTheme.surface,
                      borderColor: currentTheme.border,
                      color: currentTheme.text,
                    }),
                  ]}
                  placeholder="exemplo@email.com"
                  placeholderTextColor={currentTheme.mutedForeground}
                  value={form.email}
                  onChangeText={(value: string) =>
                    updateFormAndClearError("email", value)
                  }
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <FieldError error={fieldErrors.email} />
              </View>

              <View style={styles.halfWidth}>
                <Text style={[styles.label, { color: currentTheme.text }]}>
                  Estado Civil *
                </Text>
                <TouchableOpacity
                  style={[
                    getFieldStyle("estadoCivil", {
                      ...styles.selectContainer,
                      backgroundColor: currentTheme.surface,
                      borderColor: currentTheme.border,
                    }),
                  ]}
                  onPress={() => setShowEstadoCivilModal(true)}
                >
                  <Text
                    style={[
                      styles.selectText,
                      {
                        color: form.estadoCivil
                          ? currentTheme.text
                          : currentTheme.mutedForeground,
                      },
                    ]}
                  >
                    {form.estadoCivil || "Selecione o estado civil"}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={16}
                    color={currentTheme.mutedForeground}
                  />
                </TouchableOpacity>
                <FieldError error={fieldErrors.estadoCivil} />
              </View>
            </View>

            {/* Telefone */}
            <View style={styles.halfWidth}>
              <Text style={[styles.label, { color: currentTheme.text }]}>
                Telefone *
              </Text>
              <TextInput
                style={[
                  getFieldStyle("telefone", {
                    ...styles.input,
                    backgroundColor: currentTheme.surface,
                    borderColor: currentTheme.border,
                    color: currentTheme.text,
                  }),
                ]}
                placeholder="(XX) XXXXX-XXXX"
                placeholderTextColor={currentTheme.mutedForeground}
                value={form.telefone}
                onChangeText={(value: string) => {
                  updatePhone(value);
                  clearFieldError("telefone");
                }}
                keyboardType="phone-pad"
                maxLength={15} // 11 dígitos + 4 caracteres de máscara
              />
              <FieldError error={fieldErrors.telefone} />
            </View>

            {/* Nome da Mãe */}
            <View style={styles.fullWidth}>
              <Text style={[styles.label, { color: currentTheme.text }]}>
                Nome da Mãe *
              </Text>
              <TextInput
                style={[
                  getFieldStyle("nomeMae", {
                    ...styles.input,
                    backgroundColor: currentTheme.surface,
                    borderColor: currentTheme.border,
                    color: currentTheme.text,
                  }),
                ]}
                placeholder="Digite o nome da mãe"
                placeholderTextColor={currentTheme.mutedForeground}
                value={form.nomeMae}
                onChangeText={(value: string) =>
                  updateFormAndClearError("nomeMae", value)
                }
              />
              <FieldError error={fieldErrors.nomeMae} />
            </View>

            {/* Endereço */}
            <View
              style={[
                styles.sectionHeader,
                { borderBottomColor: currentTheme.border },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
                Endereço
              </Text>
            </View>

            {/* CEP */}
            <View style={styles.halfWidth}>
              <Text style={[styles.label, { color: currentTheme.text }]}>
                CEP *
              </Text>
              <View style={styles.cepRow}>
                <TextInput
                  style={[
                    getFieldStyle("cep", {
                      ...styles.cepInput,
                      backgroundColor: currentTheme.surface,
                      borderColor: currentTheme.border,
                      color: currentTheme.text,
                    }),
                  ]}
                  placeholder="00000-000"
                  placeholderTextColor={currentTheme.mutedForeground}
                  value={form.cep}
                  onChangeText={(value: string) => {
                    handleCEPChange(value);
                    clearFieldError("cep");
                  }}
                  keyboardType="numeric"
                  maxLength={9}
                />
                <TouchableOpacity
                  style={[
                    styles.buscarButton,
                    loadingCEP && styles.buscarButtonDisabled,
                  ]}
                  onPress={buscarCEP}
                  disabled={loadingCEP}
                >
                  {loadingCEP ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.buscarButtonText}>Buscar</Text>
                  )}
                </TouchableOpacity>
              </View>
              <FieldError error={fieldErrors.cep} />
            </View>

            {/* Rua e Número */}
            <View style={styles.row}>
              <View style={[styles.halfWidth, { flex: 2 }]}>
                <Text style={[styles.label, { color: currentTheme.text }]}>
                  Rua *
                </Text>
                <TextInput
                  style={[
                    getFieldStyle("rua", {
                      ...styles.input,
                      backgroundColor: currentTheme.surface,
                      borderColor: currentTheme.border,
                      color: currentTheme.text,
                    }),
                  ]}
                  placeholder="Nome da rua"
                  placeholderTextColor={currentTheme.mutedForeground}
                  value={form.rua}
                  onChangeText={(value: string) =>
                    updateFormAndClearError("rua", value)
                  }
                />
                <FieldError error={fieldErrors.rua} />
              </View>

              <View style={[styles.halfWidth, { flex: 1 }]}>
                <Text style={[styles.label, { color: currentTheme.text }]}>
                  Número *
                </Text>
                <TextInput
                  style={[
                    getFieldStyle("numero", {
                      ...styles.input,
                      backgroundColor: currentTheme.surface,
                      borderColor: currentTheme.border,
                      color: currentTheme.text,
                    }),
                  ]}
                  placeholder="Ex: 123"
                  placeholderTextColor={currentTheme.mutedForeground}
                  value={form.numero}
                  onChangeText={(value: string) =>
                    updateFormAndClearError("numero", value)
                  }
                />
                <FieldError error={fieldErrors.numero} />
              </View>
            </View>

            {/* Complemento */}
            <View style={styles.fullWidth}>
              <Text style={[styles.label, { color: currentTheme.text }]}>
                Complemento
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: currentTheme.surface,
                    borderColor: currentTheme.border,
                    color: currentTheme.text,
                  },
                ]}
                placeholder="Apto, bloco, casa, etc. (opcional)"
                placeholderTextColor={currentTheme.mutedForeground}
                value={form.complemento}
                onChangeText={(value: string) =>
                  updateForm("complemento", value)
                }
              />
            </View>

            {/* Bairro, Cidade e Estado */}
            <View style={styles.row}>
              <View style={styles.thirdWidth}>
                <Text style={[styles.label, { color: currentTheme.text }]}>
                  Bairro *
                </Text>
                <TextInput
                  style={[
                    getFieldStyle("bairro", {
                      ...styles.input,
                      backgroundColor: currentTheme.surface,
                      borderColor: currentTheme.border,
                      color: currentTheme.text,
                    }),
                  ]}
                  placeholder="Nome do bairro"
                  placeholderTextColor={currentTheme.mutedForeground}
                  value={form.bairro}
                  onChangeText={(value: string) =>
                    updateFormAndClearError("bairro", value)
                  }
                />
                <FieldError error={fieldErrors.bairro} />
              </View>

              <View style={styles.thirdWidth}>
                <Text style={[styles.label, { color: currentTheme.text }]}>
                  Cidade *
                </Text>
                <TextInput
                  style={[
                    getFieldStyle("cidade", {
                      ...styles.input,
                      backgroundColor: currentTheme.surface,
                      borderColor: currentTheme.border,
                      color: currentTheme.text,
                    }),
                  ]}
                  placeholder="Nome da cidade"
                  placeholderTextColor={currentTheme.mutedForeground}
                  value={form.cidade}
                  onChangeText={(value: string) =>
                    updateFormAndClearError("cidade", value)
                  }
                />
                <FieldError error={fieldErrors.cidade} />
              </View>

              <View style={styles.thirdWidth}>
                <Text style={[styles.label, { color: currentTheme.text }]}>
                  Estado *
                </Text>
                <TextInput
                  style={[
                    getFieldStyle("estado", {
                      ...styles.input,
                      backgroundColor: currentTheme.surface,
                      borderColor: currentTheme.border,
                      color: currentTheme.text,
                    }),
                  ]}
                  placeholder="UF"
                  placeholderTextColor={currentTheme.mutedForeground}
                  value={form.estado}
                  onChangeText={(value: string) =>
                    updateFormAndClearError("estado", value)
                  }
                  maxLength={2}
                />
                <FieldError error={fieldErrors.estado} />
              </View>
            </View>
          </View>
        )}

        {activeTab === "saude" && (
          <View style={styles.formContainer}>
            {/* Número SUS */}
            <View style={styles.fullWidth}>
              <Text style={[styles.label, { color: currentTheme.text }]}>
                Número SUS *
              </Text>
              <TextInput
                style={[
                  getFieldStyle("numeroSus", {
                    ...styles.input,
                    backgroundColor: currentTheme.surface,
                    borderColor: currentTheme.border,
                    color: currentTheme.text,
                  }),
                ]}
                placeholder="000 0000 0000 0000"
                placeholderTextColor={currentTheme.mutedForeground}
                value={form.numeroSus}
                onChangeText={(value: string) => {
                  updateSUS(value);
                  clearFieldError("numeroSus");
                }}
                keyboardType="numeric"
                maxLength={18} // 15 dígitos + 3 espaços
              />
              <FieldError error={fieldErrors.numeroSus} />
            </View>

            {/* Uso contínuo de medicamentos e Deficiência */}
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={[styles.label, { color: currentTheme.text }]}>
                  Faz uso contínuo de medicamentos?{" "}
                  <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[
                    styles.selectContainer,
                    {
                      backgroundColor: currentTheme.surface,
                      borderColor: currentTheme.border,
                    },
                  ]}
                  onPress={() => setShowMedicamentoModal(true)}
                >
                  <Text
                    style={[
                      styles.selectText,
                      {
                        color: form.usoMedicamentoContinuo
                          ? currentTheme.text
                          : currentTheme.mutedForeground,
                      },
                    ]}
                  >
                    {form.usoMedicamentoContinuo || "Selecione uma opção"}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={16}
                    color={currentTheme.mutedForeground}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.halfWidth}>
                <Text style={[styles.label, { color: currentTheme.text }]}>
                  Deficiência *
                </Text>
                <TouchableOpacity
                  style={[
                    getFieldStyle("deficiencia", {
                      ...styles.selectContainer,
                      backgroundColor: currentTheme.surface,
                      borderColor: currentTheme.border,
                    }),
                  ]}
                  onPress={() => setShowDeficienciaModal(true)}
                >
                  <Text
                    style={[
                      styles.selectText,
                      {
                        color: form.deficiencia
                          ? currentTheme.text
                          : currentTheme.mutedForeground,
                      },
                    ]}
                  >
                    {form.deficiencia || "Selecione uma opção"}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={16}
                    color={currentTheme.mutedForeground}
                  />
                </TouchableOpacity>
                <FieldError error={fieldErrors.deficiencia} />
              </View>
            </View>

            {/* Campo condicional: Quais medicamentos - NOVA IMPLEMENTAÇÃO COM CHIP-TAGS */}
            {form.usoMedicamentoContinuo === "Sim" && (
              <View style={styles.fullWidth}>
                <Text style={[styles.label, { color: currentTheme.text }]}>
                  Quais medicamentos? <Text style={styles.required}>*</Text>
                </Text>

                {/* Campo de busca de medicamentos */}
                <View
                  style={[
                    styles.medicamentoSearchContainer,
                    fieldErrors.quaisMedicamentos
                      ? {
                          borderColor: "#e74c3c",
                          borderWidth: 2,
                          borderRadius: 8,
                        }
                      : null,
                  ]}
                >
                  <MedicamentoSearch
                    onSelectMedicamento={(medicamento: string) => {
                      adicionarMedicamento(medicamento);
                      clearFieldError("quaisMedicamentos");
                    }}
                    selectedMedicamentos={form.quaisMedicamentos}
                    placeholder="Buscar e selecionar medicamento..."
                  />
                </View>

                <FieldError error={fieldErrors.quaisMedicamentos} />

                {/* Tags dos medicamentos selecionados */}
                <View style={styles.medicamentoTagsContainer}>
                  <ChipTags
                    tags={form.quaisMedicamentos}
                    onRemove={removerMedicamento}
                    editable={true}
                  />
                </View>
              </View>
            )}

            {/* Necessita de acompanhante */}
            <View style={styles.halfWidth}>
              <Text style={[styles.label, { color: currentTheme.text }]}>
                Necessita de acompanhante *
              </Text>
              <TouchableOpacity
                style={[
                  getFieldStyle("necessitaAcompanhante", {
                    ...styles.selectContainer,
                    backgroundColor: currentTheme.surface,
                    borderColor: currentTheme.border,
                  }),
                ]}
                onPress={() => setShowAcompanhanteModal(true)}
              >
                <Text
                  style={[
                    styles.selectText,
                    {
                      color: form.necessitaAcompanhante
                        ? currentTheme.text
                        : currentTheme.mutedForeground,
                    },
                  ]}
                >
                  {form.necessitaAcompanhante || "Selecione uma opção"}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={16}
                  color={currentTheme.mutedForeground}
                />
              </TouchableOpacity>
              <FieldError error={fieldErrors.necessitaAcompanhante} />
            </View>

            {/* Dados do Acompanhante - Exibido apenas se necessitaAcompanhante for "Sim" */}
            {form.necessitaAcompanhante === "Sim" && (
              <>
                {/* Título da seção */}
                <View style={styles.fullWidth}>
                  <Text
                    style={[styles.sectionTitle, { color: currentTheme.text }]}
                  >
                    Dados do Acompanhante
                  </Text>
                </View>

                {/* Nome do Acompanhante */}
                <View style={styles.fullWidth}>
                  <Text style={[styles.label, { color: currentTheme.text }]}>
                    Nome completo do acompanhante *
                  </Text>
                  <TextInput
                    style={[
                      getFieldStyle("acompanhanteNome", {
                        ...styles.input,
                        backgroundColor: currentTheme.surface,
                        borderColor: currentTheme.border,
                        color: currentTheme.text,
                      }),
                    ]}
                    placeholder="Digite o nome completo do acompanhante"
                    placeholderTextColor={currentTheme.mutedForeground}
                    value={form.acompanhanteNome}
                    onChangeText={(value: string) =>
                      updateFormAndClearError("acompanhanteNome", value)
                    }
                  />
                  <FieldError error={fieldErrors.acompanhanteNome} />
                </View>

                {/* CPF e RG do Acompanhante */}
                <View style={styles.rowContainer}>
                  <View style={styles.halfWidth}>
                    <Text style={[styles.label, { color: currentTheme.text }]}>
                      CPF do acompanhante *
                    </Text>
                    <TextInput
                      style={[
                        getFieldStyle("acompanhanteCpf", {
                          ...styles.input,
                          backgroundColor: currentTheme.surface,
                          borderColor: currentTheme.border,
                          color: currentTheme.text,
                        }),
                      ]}
                      placeholder="000.000.000-00"
                      placeholderTextColor={currentTheme.mutedForeground}
                      value={form.acompanhanteCpf}
                      onChangeText={(value: string) =>
                        updateFormAndClearError(
                          "acompanhanteCpf",
                          formatCPF(value)
                        )
                      }
                      keyboardType="numeric"
                      maxLength={14}
                    />
                    <FieldError error={fieldErrors.acompanhanteCpf} />
                  </View>

                  <View style={styles.halfWidth}>
                    <Text style={[styles.label, { color: currentTheme.text }]}>
                      RG do acompanhante *
                    </Text>
                    <TextInput
                      style={[
                        getFieldStyle("acompanhanteRg", {
                          ...styles.input,
                          backgroundColor: currentTheme.surface,
                          borderColor: currentTheme.border,
                          color: currentTheme.text,
                        }),
                      ]}
                      placeholder="Digite o RG"
                      placeholderTextColor={currentTheme.mutedForeground}
                      value={form.acompanhanteRg}
                      onChangeText={(value: string) =>
                        updateFormAndClearError(
                          "acompanhanteRg",
                          formatRG(value)
                        )
                      }
                      maxLength={12}
                    />
                    <FieldError error={fieldErrors.acompanhanteRg} />
                  </View>
                </View>

                {/* Data de Nascimento e Sexo do Acompanhante */}
                <View style={styles.rowContainer}>
                  <View style={styles.halfWidth}>
                    <Text style={[styles.label, { color: currentTheme.text }]}>
                      Data de nascimento *
                    </Text>
                    <TextInput
                      style={[
                        getFieldStyle("acompanhanteDataNascimento", {
                          ...styles.input,
                          backgroundColor: currentTheme.surface,
                          borderColor: currentTheme.border,
                          color: currentTheme.text,
                        }),
                      ]}
                      placeholder="dd/MM/yyyy"
                      placeholderTextColor={currentTheme.mutedForeground}
                      value={form.acompanhanteDataNascimento}
                      onChangeText={(value: string) => {
                        const formatted = formatBirthDate(value);
                        updateFormAndClearError(
                          "acompanhanteDataNascimento",
                          formatted
                        );
                      }}
                      keyboardType="numeric"
                      maxLength={10} // dd/MM/yyyy
                    />
                    <FieldError
                      error={fieldErrors.acompanhanteDataNascimento}
                    />
                  </View>

                  <View style={styles.halfWidth}>
                    <Text style={[styles.label, { color: currentTheme.text }]}>
                      Sexo *
                    </Text>
                    <TouchableOpacity
                      style={[
                        getFieldStyle("acompanhanteSexo", {
                          ...styles.selectContainer,
                          backgroundColor: currentTheme.surface,
                          borderColor: currentTheme.border,
                        }),
                      ]}
                      onPress={() => setShowAcompanhanteSexoModal(true)}
                    >
                      <Text
                        style={[
                          styles.selectText,
                          {
                            color: form.acompanhanteSexo
                              ? currentTheme.text
                              : currentTheme.mutedForeground,
                          },
                        ]}
                      >
                        {form.acompanhanteSexo || "Selecione o sexo"}
                      </Text>
                      <Ionicons
                        name="chevron-down"
                        size={16}
                        color={currentTheme.mutedForeground}
                      />
                    </TouchableOpacity>
                    <FieldError error={fieldErrors.acompanhanteSexo} />
                  </View>
                </View>

                {/* Grau de Parentesco */}
                <View style={styles.fullWidth}>
                  <Text style={[styles.label, { color: currentTheme.text }]}>
                    Grau de parentesco *
                  </Text>
                  <TextInput
                    style={[
                      getFieldStyle("acompanhanteGrauParentesco", {
                        ...styles.input,
                        backgroundColor: currentTheme.surface,
                        borderColor: currentTheme.border,
                        color: currentTheme.text,
                      }),
                    ]}
                    value={form.acompanhanteGrauParentesco}
                    onChangeText={(text) =>
                      updateFormAndClearError(
                        "acompanhanteGrauParentesco",
                        text
                      )
                    }
                    placeholder="Ex: Pai, Mãe, Filho, Esposo, etc."
                    placeholderTextColor={currentTheme.mutedForeground}
                  />
                  <FieldError error={fieldErrors.acompanhanteGrauParentesco} />
                </View>
              </>
            )}

            {/* Doenças crônicas - NOVA IMPLEMENTAÇÃO COM CHIP-TAGS */}
            <View style={styles.fullWidth}>
              <Text style={[styles.label, { color: currentTheme.text }]}>
                Doenças crônicas
              </Text>

              {/* Campo de busca de doenças crônicas */}
              <View style={styles.doencaSearchContainer}>
                <DoencaCronicaSearch
                  onSelectDoenca={adicionarDoencaCronica}
                  selectedDoencas={form.doencasCronicas}
                  placeholder="Buscar e selecionar doença crônica..."
                />
              </View>

              {/* Tags das doenças crônicas selecionadas */}
              <View style={styles.doencaTagsContainer}>
                <ChipTags
                  tags={form.doencasCronicas}
                  onRemove={removerDoencaCronica}
                  editable={true}
                />
              </View>
            </View>

            {/* Observações Médicas */}
            <View style={styles.fullWidth}>
              <Text style={[styles.label, { color: currentTheme.text }]}>
                Observações Médicas
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: currentTheme.surface,
                    borderColor: currentTheme.border,
                    color: currentTheme.text,
                  },
                ]}
                placeholder="Digite observações médicas relevantes..."
                placeholderTextColor={currentTheme.mutedForeground}
                value={form.observacoesMedicas}
                onChangeText={(value: string) =>
                  updateForm("observacoesMedicas", value)
                }
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
        )}

        {/* Modals de Seleção */}
        {/* Modal Medicamento */}
        <Modal
          visible={showMedicamentoModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowMedicamentoModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowMedicamentoModal(false)}
          >
            <View
              style={[
                styles.modalContent,
                { backgroundColor: currentTheme.surface },
              ]}
            >
              <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
                Uso contínuo de medicamentos
              </Text>
              {medicamentoOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.modalOption}
                  onPress={() =>
                    handleSelectOption("usoMedicamentoContinuo", option)
                  }
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      { color: currentTheme.text },
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Modal Deficiência */}
        <Modal
          visible={showDeficienciaModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDeficienciaModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowDeficienciaModal(false)}
          >
            <View
              style={[
                styles.modalContent,
                { backgroundColor: currentTheme.surface },
              ]}
            >
              <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
                Deficiência
              </Text>
              {deficienciaOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.modalOption}
                  onPress={() => handleSelectOption("deficiencia", option)}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      { color: currentTheme.text },
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Modal Acompanhante */}
        <Modal
          visible={showAcompanhanteModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAcompanhanteModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowAcompanhanteModal(false)}
          >
            <View
              style={[
                styles.modalContent,
                { backgroundColor: currentTheme.surface },
              ]}
            >
              <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
                Necessita de acompanhante
              </Text>
              {acompanhanteOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.modalOption}
                  onPress={() =>
                    handleSelectOption("necessitaAcompanhante", option)
                  }
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      { color: currentTheme.text },
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Modal Estado Civil */}
        <Modal
          visible={showEstadoCivilModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowEstadoCivilModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowEstadoCivilModal(false)}
          >
            <View
              style={[
                styles.modalContent,
                { backgroundColor: currentTheme.surface },
              ]}
            >
              <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
                Estado Civil
              </Text>
              {estadoCivilOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.modalOption}
                  onPress={() => handleSelectOption("estadoCivil", option)}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      { color: currentTheme.text },
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Modal Sexo */}
        <Modal
          visible={showSexoModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowSexoModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowSexoModal(false)}
          >
            <View
              style={[
                styles.modalContent,
                { backgroundColor: currentTheme.surface },
              ]}
            >
              <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
                Sexo
              </Text>
              {sexoOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.modalOption}
                  onPress={() => handleSelectOption("sexo", option)}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      { color: currentTheme.text },
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Modal Sexo do Acompanhante */}
        <Modal
          visible={showAcompanhanteSexoModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAcompanhanteSexoModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowAcompanhanteSexoModal(false)}
          >
            <View
              style={[
                styles.modalContent,
                { backgroundColor: currentTheme.surface },
              ]}
            >
              <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
                Sexo do acompanhante
              </Text>
              {sexoOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.modalOption}
                  onPress={() => handleSelectOption("acompanhanteSexo", option)}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      { color: currentTheme.text },
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Botões de Ação */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelar}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, isLoading && { opacity: 0.7 }]}
            onPress={handleSalvar}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Salvar</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de Sucesso Personalizado */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          console.log("📱 Modal foi fechado - executando navegação...");
          setShowSuccessModal(false);
          if (onBack) {
            console.log("🔄 Executando onBack após modal...");
            onBack();
          } else {
            console.log("❌ onBack não disponível no modal");
          }
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            console.log("📱 Overlay clicado - fechando modal...");
            setShowSuccessModal(false);
            if (onBack) {
              console.log("🔄 Executando onBack após overlay...");
              onBack();
            }
          }}
        >
          <TouchableOpacity
            style={styles.successModalContent}
            activeOpacity={1}
          >
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
            </View>

            <Text style={styles.successTitle}>Sucesso!</Text>
            <Text style={styles.successMessage}>{successMessage}</Text>

            <TouchableOpacity
              style={styles.successButton}
              onPress={() => {
                console.log("👆 Botão OK clicado no modal personalizado...");
                setShowSuccessModal(false);
                if (onBack) {
                  console.log("🔄 Executando onBack após botão OK...");
                  onBack();
                } else {
                  console.log("❌ onBack não disponível no botão OK");
                }
              }}
            >
              <Text style={styles.successButtonText}>OK</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    marginBottom: 24,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
  },
  formContainer: {
    gap: 16,
  },
  fullWidth: {
    width: "100%",
  },
  row: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
  },
  halfWidth: {
    flex: 1,
  },
  thirdWidth: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    minHeight: 44,
  },
  sectionHeader: {
    borderBottomWidth: 1,
    paddingBottom: 8,
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  cepRow: {
    flexDirection: "row",
    gap: 8,
  },
  cepInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    minHeight: 44,
  },
  buscarButton: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  buscarButtonDisabled: {
    backgroundColor: "#E5E7EB",
    opacity: 0.6,
  },
  buscarButtonText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "500",
  },
  comingSoon: {
    fontSize: 16,
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 40,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
    paddingTop: 32,
    paddingBottom: 24,
  },
  cancelButton: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: "#8A9E8E", // Verde institucional da Prefeitura de Jambeiro
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  selectContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 44,
  },
  selectText: {
    fontSize: 14,
    flex: 1,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: "top",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 12,
    padding: 24,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 4,
  },
  modalOptionText: {
    fontSize: 16,
    textAlign: "center",
  },
  required: {
    color: "#8A9E8E", // Verde institucional da Prefeitura de Jambeiro
    fontWeight: "600",
  },
  // 💊 Estilos para os novos componentes de medicamentos
  medicamentoSearchContainer: {
    marginBottom: 12,
    zIndex: 1000, // Para o dropdown ficar por cima
  },
  medicamentoTagsContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    minHeight: 60,
  },
  // 🩺 Estilos para os novos componentes de doenças crônicas
  doencaSearchContainer: {
    marginBottom: 12,
    zIndex: 999, // Menor que medicamento para evitar conflito
  },
  doencaTagsContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: "#F8F9FA", // Mesmo estilo dos medicamentos
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    minHeight: 60,
  },
  photoAndBasicInfo: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 20,
  },
  photoSection: {
    flex: 1,
    maxWidth: 200,
  },
  basicInfoSection: {
    flex: 2,
    gap: 16,
  },
  // Estilos para o modal de sucesso
  successModalContent: {
    backgroundColor: "#FFFFFF",
    margin: 20,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 12,
    textAlign: "center",
  },
  successMessage: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 24,
  },
  successButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 100,
  },
  successButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  // Estilos para campos do acompanhante
  rowContainer: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
  },
});
