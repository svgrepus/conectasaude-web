import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { Municipe } from '../../types';
import ChipTags from '../../components/ChipTags';
import MedicamentoSearch from '../../components/MedicamentoSearch';

interface CadastroMunicipeForm {
  nomeCompleto: string;
  cpf: string;
  rg: string;
  dataNascimento: string;
  estadoCivil: string;
  sexo: string;
  email: string;
  telefone: string;
  nomeMae: string;
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  // Dados de Saúde
  numeroSus: string;
  usoMedicamentoContinuo: string;
  quaisMedicamentos: string[]; // Mudança: agora é array de strings
  deficiencia: string;
  necessitaAcompanhante: string;
  doencasCronicas: string;
}

interface CadastroMunicipeScreenProps {
  onBack?: () => void;
  municipeToEdit?: Municipe;
}

export const CadastroMunicipeScreen: React.FC<CadastroMunicipeScreenProps> = ({ 
  onBack, 
  municipeToEdit 
}) => {
  console.log('🔧 CadastroMunicipeScreen: Props recebidas', { onBack: !!onBack, municipeToEdit: !!municipeToEdit });
  
  const [activeTab, setActiveTab] = useState<'pessoais' | 'saude'>('pessoais');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showMedicamentoModal, setShowMedicamentoModal] = useState(false);
  const [showDeficienciaModal, setShowDeficienciaModal] = useState(false);
  const [showAcompanhanteModal, setShowAcompanhanteModal] = useState(false);
  const [showEstadoCivilModal, setShowEstadoCivilModal] = useState(false);
  const [showSexoModal, setShowSexoModal] = useState(false);
  
  const isEditMode = !!municipeToEdit;

  const [form, setForm] = useState<CadastroMunicipeForm>({
    nomeCompleto: '',
    cpf: '',
    rg: '',
    dataNascimento: '',
    estadoCivil: '',
    sexo: '',
    email: '',
    telefone: '',
    nomeMae: '',
    cep: '',
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    // Dados de Saúde
    numeroSus: '',
    usoMedicamentoContinuo: '',
    quaisMedicamentos: [], // Mudança: agora é array vazio
    deficiencia: '',
    necessitaAcompanhante: '',
    doencasCronicas: '',
  });

  // Effect para carregar dados do munícipe quando estiver editando
  useEffect(() => {
    if (municipeToEdit) {
      console.log('🔄 Carregando dados do munícipe para edição:', municipeToEdit);
      
      // Função para formatar data para o formato do input
      const formatDateForInput = (dateString: string) => {
        try {
          const date = new Date(dateString);
          return date.toISOString().split('T')[0]; // YYYY-MM-DD
        } catch {
          return '';
        }
      };

      // Função para converter string de medicamentos em array
      const parseMedicamentos = (medicamentosString: string): string[] => {
        if (!medicamentosString || medicamentosString.trim() === '') return [];
        
        // Se for um JSON array, tentar fazer parse
        if (medicamentosString.startsWith('[') && medicamentosString.endsWith(']')) {
          try {
            return JSON.parse(medicamentosString);
          } catch {
            // Se falhar, tratar como string separada por vírgulas
            return medicamentosString.slice(1, -1).split(',').map(med => med.trim()).filter(med => med);
          }
        }
        
        // Tratar como string separada por vírgulas
        return medicamentosString.split(',').map(med => med.trim()).filter(med => med);
      };

      // Função para converter boolean para Sim/Não
      const convertBooleanToSimNao = (value: any): string => {
        if (value === true || value === 'true' || value === 1 || value === '1') return 'Sim';
        if (value === false || value === 'false' || value === 0 || value === '0') return 'Não';
        if (typeof value === 'string' && value.toLowerCase().includes('sim')) return 'Sim';
        if (typeof value === 'string' && value.toLowerCase().includes('não')) return 'Não';
        return value || '';
      };

      setForm({
        nomeCompleto: municipeToEdit.nome_completo || '',
        cpf: municipeToEdit.cpf || '',
        rg: municipeToEdit.rg || '',
        dataNascimento: formatDateForInput(municipeToEdit.data_nascimento),
        estadoCivil: municipeToEdit.estado_civil || '',
        sexo: municipeToEdit.sexo || '',
        email: municipeToEdit.email || '',
        telefone: municipeToEdit.telefone || '',
        nomeMae: municipeToEdit.nome_mae || '',
        // Campos de endereço da view vw_municipes_completo
        cep: municipeToEdit.cep || '',
        rua: municipeToEdit.endereco || municipeToEdit.logradouro || '',
        numero: municipeToEdit.numero_endereco || municipeToEdit.numero || '',
        bairro: municipeToEdit.bairro || '',
        cidade: municipeToEdit.cidade || '',
        estado: municipeToEdit.estado || municipeToEdit.uf || '', // Adicionando fallback para uf
        // Campos de saúde da view vw_municipes_completo
        numeroSus: municipeToEdit.cartao_sus || '',
        usoMedicamentoContinuo: convertBooleanToSimNao(
          municipeToEdit.uso_continuo_medicamentos || 
          municipeToEdit.uso_medicamento_continuo || 
          municipeToEdit.usa_medicamentos_continuos ||
          municipeToEdit.usoMedicamentoContinuo
        ),
        quaisMedicamentos: parseMedicamentos(municipeToEdit.quaisMedicamentos || municipeToEdit.quais_medicamentos || ''), // Convertendo para array
        deficiencia: municipeToEdit.deficiencia || municipeToEdit.tem_deficiencia_fisica || municipeToEdit.possui_deficiencia || '',
        necessitaAcompanhante: municipeToEdit.necessitaAcompanhante || municipeToEdit.necessita_acompanhante || municipeToEdit.precisa_acompanhante || '',
        doencasCronicas: municipeToEdit.doencasCronicas || municipeToEdit.doencas_cronicas || municipeToEdit.doenca_cronica || municipeToEdit.tipo_doenca || '',
      });
      
      // Debug: verificar dados carregados
      console.log('🔍 Dados do munícipe carregados:', {
        estado: municipeToEdit.estado,
        uf: municipeToEdit.uf,
        estadoCivil: municipeToEdit.estado_civil,
        sexo: municipeToEdit.sexo
      });
    }
  }, [municipeToEdit]);

  const currentTheme = isDarkMode ? theme.dark : theme.light;

  // Opções para os selects
  const medicamentoOptions = ['Sim', 'Não'];
  const deficienciaOptions = ['Nenhuma', 'Física', 'Visual', 'Auditiva', 'Intelectual', 'Múltipla'];
  const acompanhanteOptions = ['Sim', 'Não'];
  const estadoCivilOptions = ['SOLTEIRO', 'CASADO', 'DIVORCIADO', 'VIÚVO', 'UNIÃO ESTÁVEL', 'SEPARADO'];
  const sexoOptions = ['Feminino', 'Masculino'];

  const updateForm = (field: keyof CadastroMunicipeForm, value: string | string[]) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // 💊 Funções para gerenciar medicamentos
  const adicionarMedicamento = (medicamento: string) => {
    const medicamentosAtuais = form.quaisMedicamentos;
    if (!medicamentosAtuais.includes(medicamento)) {
      updateForm('quaisMedicamentos', [...medicamentosAtuais, medicamento]);
    }
  };

  const removerMedicamento = (medicamento: string) => {
    const medicamentosAtuais = form.quaisMedicamentos;
    updateForm('quaisMedicamentos', medicamentosAtuais.filter(med => med !== medicamento));
  };

  const handleSelectOption = (field: keyof CadastroMunicipeForm, value: string) => {
    updateForm(field, value);
    
    // Limpar campo de medicamentos se mudar para "Não"
    if (field === 'usoMedicamentoContinuo' && value === 'Não') {
      updateForm('quaisMedicamentos', []); // Agora limpa com array vazio
    }
    
    // Fechar todos os modais
    setShowMedicamentoModal(false);
    setShowDeficienciaModal(false);
    setShowAcompanhanteModal(false);
    setShowEstadoCivilModal(false);
    setShowSexoModal(false);
  };

  const buscarCEP = async () => {
    if (form.cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${form.cep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          updateForm('rua', data.logradouro);
          updateForm('bairro', data.bairro);
          updateForm('cidade', data.localidade);
          updateForm('estado', data.uf);
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  const handleSalvar = () => {
    // Validação básica
    if (!form.nomeCompleto || !form.cpf || !form.email) {
      Alert.alert('Erro', 'Por favor, preencha os campos obrigatórios dos dados pessoais');
      return;
    }

    // Validação condicional para medicamentos
    if (form.usoMedicamentoContinuo === 'Sim' && form.quaisMedicamentos.length === 0) {
      Alert.alert('Erro', 'Por favor, selecione pelo menos um medicamento');
      return;
    }

    Alert.alert('Sucesso', 'Munícipe cadastrado com sucesso!', [
      { text: 'OK', onPress: onBack }
    ]);
  };

  const handleCancelar = () => {
    console.log('🔧 handleCancelar: Função chamada');
    console.log('🔧 onBack disponível?', !!onBack);
    console.log('🔧 tipo de onBack:', typeof onBack);
    
    Alert.alert(
      'Cancelar',
      'Tem certeza que deseja cancelar? Todos os dados serão perdidos.',
      [
        { text: 'Não', style: 'cancel' },
        { text: 'Sim', onPress: () => {
          console.log('🔙 Cancelando e voltando à tela anterior');
          console.log('🔙 Tentando chamar onBack...');
          
          if (onBack) {
            console.log('✅ onBack existe, chamando...');
            onBack();
            console.log('✅ onBack foi chamado');
          } else {
            console.log('⚠️ onBack não está definido');
            console.log('⚠️ Props disponíveis:', Object.keys({ onBack, municipeToEdit }));
          }
        }}
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: currentTheme.text }]}>
            {isEditMode ? 'Editar Munícipe' : 'Cadastro de Munícipe'}
          </Text>
        </View>

        {/* Tabs */}
        <View style={[styles.tabContainer, { borderBottomColor: currentTheme.border }]}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'pessoais' && styles.activeTab,
              activeTab === 'pessoais' && { borderBottomColor: '#8A9E8E' }
            ]}
            onPress={() => setActiveTab('pessoais')}
          >
            <Ionicons
              name="person"
              size={20}
              color={activeTab === 'pessoais' ? '#8A9E8E' : currentTheme.mutedForeground}
            />
            <Text style={[
              styles.tabText,
              { color: activeTab === 'pessoais' ? '#8A9E8E' : currentTheme.mutedForeground }
            ]}>
              Dados Pessoais
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'saude' && styles.activeTab,
              activeTab === 'saude' && { borderBottomColor: '#8A9E8E' }
            ]}
            onPress={() => setActiveTab('saude')}
          >
            <Ionicons
              name="medical"
              size={20}
              color={activeTab === 'saude' ? '#8A9E8E' : currentTheme.mutedForeground}
            />
            <Text style={[
              styles.tabText,
              { color: activeTab === 'saude' ? '#8A9E8E' : currentTheme.mutedForeground }
            ]}>
              Dados de Saúde
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        {activeTab === 'pessoais' && (
          <View style={styles.formContainer}>
            {/* Nome Completo */}
            <View style={styles.fullWidth}>
              <Text style={[styles.label, { color: currentTheme.text }]}>Nome Completo</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: currentTheme.surface, 
                  borderColor: currentTheme.border,
                  color: currentTheme.text 
                }]}
                placeholder="Digite o nome completo"
                placeholderTextColor={currentTheme.mutedForeground}
                value={form.nomeCompleto}
                onChangeText={(value) => updateForm('nomeCompleto', value)}
              />
            </View>

            {/* CPF e RG */}
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={[styles.label, { color: currentTheme.text }]}>CPF</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: currentTheme.surface, 
                    borderColor: currentTheme.border,
                    color: currentTheme.text 
                  }]}
                  placeholder="000.000.000-00"
                  placeholderTextColor={currentTheme.mutedForeground}
                  value={form.cpf}
                  onChangeText={(value) => updateForm('cpf', value)}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.halfWidth}>
                <Text style={[styles.label, { color: currentTheme.text }]}>RG</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: currentTheme.surface, 
                    borderColor: currentTheme.border,
                    color: currentTheme.text 
                  }]}
                  placeholder="Digite o RG"
                  placeholderTextColor={currentTheme.mutedForeground}
                  value={form.rg}
                  onChangeText={(value) => updateForm('rg', value)}
                />
              </View>
            </View>

            {/* Data de Nascimento e Estado Civil */}
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={[styles.label, { color: currentTheme.text }]}>Data de Nascimento</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: currentTheme.surface, 
                    borderColor: currentTheme.border,
                    color: currentTheme.text 
                  }]}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor={currentTheme.mutedForeground}
                  value={form.dataNascimento}
                  onChangeText={(value) => updateForm('dataNascimento', value)}
                />
              </View>

              <View style={styles.halfWidth}>
                <Text style={[styles.label, { color: currentTheme.text }]}>Estado Civil</Text>
                <TouchableOpacity
                  style={[styles.selectContainer, { 
                    backgroundColor: currentTheme.surface, 
                    borderColor: currentTheme.border 
                  }]}
                  onPress={() => setShowEstadoCivilModal(true)}
                >
                  <Text style={[
                    styles.selectText, 
                    { color: form.estadoCivil ? currentTheme.text : currentTheme.mutedForeground }
                  ]}>
                    {form.estadoCivil || 'Selecione o estado civil'}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={currentTheme.mutedForeground} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sexo e E-mail */}
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={[styles.label, { color: currentTheme.text }]}>Sexo</Text>
                <TouchableOpacity
                  style={[styles.selectContainer, { 
                    backgroundColor: currentTheme.surface, 
                    borderColor: currentTheme.border 
                  }]}
                  onPress={() => setShowSexoModal(true)}
                >
                  <Text style={[
                    styles.selectText, 
                    { color: form.sexo ? currentTheme.text : currentTheme.mutedForeground }
                  ]}>
                    {form.sexo || 'Selecione o sexo'}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={currentTheme.mutedForeground} />
                </TouchableOpacity>
              </View>

              <View style={styles.halfWidth}>
                <Text style={[styles.label, { color: currentTheme.text }]}>E-mail</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: currentTheme.surface, 
                    borderColor: currentTheme.border,
                    color: currentTheme.text 
                  }]}
                  placeholder="email@exemplo.com"
                  placeholderTextColor={currentTheme.mutedForeground}
                  value={form.email}
                  onChangeText={(value) => updateForm('email', value)}
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Telefone */}
            <View style={styles.halfWidth}>
              <Text style={[styles.label, { color: currentTheme.text }]}>Telefone</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: currentTheme.surface, 
                  borderColor: currentTheme.border,
                  color: currentTheme.text 
                }]}
                placeholder="(XX) XXXXX-XXXX"
                placeholderTextColor={currentTheme.mutedForeground}
                value={form.telefone}
                onChangeText={(value) => updateForm('telefone', value)}
                keyboardType="phone-pad"
              />
            </View>

            {/* Nome da Mãe */}
            <View style={styles.fullWidth}>
              <Text style={[styles.label, { color: currentTheme.text }]}>Nome da Mãe</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: currentTheme.surface, 
                  borderColor: currentTheme.border,
                  color: currentTheme.text 
                }]}
                placeholder="Digite o nome da mãe"
                placeholderTextColor={currentTheme.mutedForeground}
                value={form.nomeMae}
                onChangeText={(value) => updateForm('nomeMae', value)}
              />
            </View>

            {/* Endereço */}
            <View style={[styles.sectionHeader, { borderBottomColor: currentTheme.border }]}>
              <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Endereço</Text>
            </View>

            {/* CEP */}
            <View style={styles.halfWidth}>
              <Text style={[styles.label, { color: currentTheme.text }]}>CEP</Text>
              <View style={styles.cepRow}>
                <TextInput
                  style={[styles.cepInput, { 
                    backgroundColor: currentTheme.surface, 
                    borderColor: currentTheme.border,
                    color: currentTheme.text 
                  }]}
                  placeholder="00000-000"
                  placeholderTextColor={currentTheme.mutedForeground}
                  value={form.cep}
                  onChangeText={(value) => updateForm('cep', value)}
                  keyboardType="numeric"
                  maxLength={8}
                />
                <TouchableOpacity style={styles.buscarButton} onPress={buscarCEP}>
                  <Text style={styles.buscarButtonText}>Buscar</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Rua e Número */}
            <View style={styles.row}>
              <View style={[styles.halfWidth, { flex: 2 }]}>
                <Text style={[styles.label, { color: currentTheme.text }]}>Rua</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: currentTheme.surface, 
                    borderColor: currentTheme.border,
                    color: currentTheme.text 
                  }]}
                  placeholder="Nome da rua"
                  placeholderTextColor={currentTheme.mutedForeground}
                  value={form.rua}
                  onChangeText={(value) => updateForm('rua', value)}
                />
              </View>

              <View style={[styles.halfWidth, { flex: 1 }]}>
                <Text style={[styles.label, { color: currentTheme.text }]}>Número</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: currentTheme.surface, 
                    borderColor: currentTheme.border,
                    color: currentTheme.text 
                  }]}
                  placeholder="Ex: 123"
                  placeholderTextColor={currentTheme.mutedForeground}
                  value={form.numero}
                  onChangeText={(value) => updateForm('numero', value)}
                />
              </View>
            </View>

            {/* Bairro, Cidade e Estado */}
            <View style={styles.row}>
              <View style={styles.thirdWidth}>
                <Text style={[styles.label, { color: currentTheme.text }]}>Bairro</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: currentTheme.surface, 
                    borderColor: currentTheme.border,
                    color: currentTheme.text 
                  }]}
                  placeholder="Nome do bairro"
                  placeholderTextColor={currentTheme.mutedForeground}
                  value={form.bairro}
                  onChangeText={(value) => updateForm('bairro', value)}
                />
              </View>

              <View style={styles.thirdWidth}>
                <Text style={[styles.label, { color: currentTheme.text }]}>Cidade</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: currentTheme.surface, 
                    borderColor: currentTheme.border,
                    color: currentTheme.text 
                  }]}
                  placeholder="Nome da cidade"
                  placeholderTextColor={currentTheme.mutedForeground}
                  value={form.cidade}
                  onChangeText={(value) => updateForm('cidade', value)}
                />
              </View>

              <View style={styles.thirdWidth}>
                <Text style={[styles.label, { color: currentTheme.text }]}>Estado</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: currentTheme.surface, 
                    borderColor: currentTheme.border,
                    color: currentTheme.text 
                  }]}
                  placeholder="UF"
                  placeholderTextColor={currentTheme.mutedForeground}
                  value={form.estado}
                  onChangeText={(value) => updateForm('estado', value)}
                  maxLength={2}
                />
              </View>
            </View>

            {/* Upload de Foto */}
            <View style={[styles.sectionHeader, { borderBottomColor: currentTheme.border }]}>
              <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Foto</Text>
            </View>

            <View style={[styles.uploadArea, { 
              backgroundColor: currentTheme.surface, 
              borderColor: currentTheme.border 
            }]}>
              <Ionicons name="cloud-upload" size={60} color={currentTheme.mutedForeground} />
              <Text style={[styles.uploadTitle, { color: currentTheme.text }]}>Upload de Foto</Text>
              <Text style={[styles.uploadSubtitle, { color: currentTheme.mutedForeground }]}>
                Clique ou arraste para adicionar uma foto do munícipe
              </Text>
              
              <View style={styles.uploadButtons}>
                <TouchableOpacity style={styles.uploadButton}>
                  <Ionicons name="camera" size={16} color="#6b7280" />
                  <Text style={styles.uploadButtonText}>Capturar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.uploadButton}>
                  <Ionicons name="document" size={16} color="#6b7280" />
                  <Text style={styles.uploadButtonText}>Escolher Arquivo</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'saude' && (
          <View style={styles.formContainer}>
            {/* Número SUS */}
            <View style={styles.fullWidth}>
              <Text style={[styles.label, { color: currentTheme.text }]}>Número SUS</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: currentTheme.surface, 
                  borderColor: currentTheme.border,
                  color: currentTheme.text 
                }]}
                placeholder="Digite o número do SUS"
                placeholderTextColor={currentTheme.mutedForeground}
                value={form.numeroSus}
                onChangeText={(value) => updateForm('numeroSus', value)}
                keyboardType="numeric"
              />
            </View>

            {/* Uso contínuo de medicamentos e Deficiência */}
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={[styles.label, { color: currentTheme.text }]}>
                  Faz uso contínuo de medicamentos? <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[styles.selectContainer, { 
                    backgroundColor: currentTheme.surface, 
                    borderColor: currentTheme.border 
                  }]}
                  onPress={() => setShowMedicamentoModal(true)}
                >
                  <Text style={[
                    styles.selectText, 
                    { color: form.usoMedicamentoContinuo ? currentTheme.text : currentTheme.mutedForeground }
                  ]}>
                    {form.usoMedicamentoContinuo || 'Selecione uma opção'}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={currentTheme.mutedForeground} />
                </TouchableOpacity>
              </View>

              <View style={styles.halfWidth}>
                <Text style={[styles.label, { color: currentTheme.text }]}>Deficiência</Text>
                <TouchableOpacity
                  style={[styles.selectContainer, { 
                    backgroundColor: currentTheme.surface, 
                    borderColor: currentTheme.border 
                  }]}
                  onPress={() => setShowDeficienciaModal(true)}
                >
                  <Text style={[
                    styles.selectText, 
                    { color: form.deficiencia ? currentTheme.text : currentTheme.mutedForeground }
                  ]}>
                    {form.deficiencia || 'Selecione uma opção'}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={currentTheme.mutedForeground} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Campo condicional: Quais medicamentos - NOVA IMPLEMENTAÇÃO COM CHIP-TAGS */}
            {form.usoMedicamentoContinuo === 'Sim' && (
              <View style={styles.fullWidth}>
                <Text style={[styles.label, { color: currentTheme.text }]}>
                  Quais medicamentos? <Text style={styles.required}>*</Text>
                </Text>
                
                {/* Campo de busca de medicamentos */}
                <View style={styles.medicamentoSearchContainer}>
                  <MedicamentoSearch
                    onSelectMedicamento={adicionarMedicamento}
                    selectedMedicamentos={form.quaisMedicamentos}
                    placeholder="Buscar e selecionar medicamento..."
                  />
                </View>

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
              <Text style={[styles.label, { color: currentTheme.text }]}>Necessita de acompanhante</Text>
              <TouchableOpacity
                style={[styles.selectContainer, { 
                  backgroundColor: currentTheme.surface, 
                  borderColor: currentTheme.border 
                }]}
                onPress={() => setShowAcompanhanteModal(true)}
              >
                <Text style={[
                  styles.selectText, 
                  { color: form.necessitaAcompanhante ? currentTheme.text : currentTheme.mutedForeground }
                ]}>
                  {form.necessitaAcompanhante || 'Selecione uma opção'}
                </Text>
                <Ionicons name="chevron-down" size={16} color={currentTheme.mutedForeground} />
              </TouchableOpacity>
            </View>

            {/* Doenças crônicas */}
            <View style={styles.fullWidth}>
              <Text style={[styles.label, { color: currentTheme.text }]}>Doenças crônicas</Text>
              <TextInput
                style={[styles.textArea, { 
                  backgroundColor: currentTheme.surface, 
                  borderColor: currentTheme.border,
                  color: currentTheme.text 
                }]}
                placeholder="Liste as doenças crônicas, se houver"
                placeholderTextColor={currentTheme.mutedForeground}
                value={form.doencasCronicas}
                onChangeText={(value) => updateForm('doencasCronicas', value)}
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
            <View style={[styles.modalContent, { backgroundColor: currentTheme.surface }]}>
              <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
                Uso contínuo de medicamentos
              </Text>
              {medicamentoOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.modalOption}
                  onPress={() => handleSelectOption('usoMedicamentoContinuo', option)}
                >
                  <Text style={[styles.modalOptionText, { color: currentTheme.text }]}>
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
            <View style={[styles.modalContent, { backgroundColor: currentTheme.surface }]}>
              <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
                Deficiência
              </Text>
              {deficienciaOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.modalOption}
                  onPress={() => handleSelectOption('deficiencia', option)}
                >
                  <Text style={[styles.modalOptionText, { color: currentTheme.text }]}>
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
            <View style={[styles.modalContent, { backgroundColor: currentTheme.surface }]}>
              <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
                Necessita de acompanhante
              </Text>
              {acompanhanteOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.modalOption}
                  onPress={() => handleSelectOption('necessitaAcompanhante', option)}
                >
                  <Text style={[styles.modalOptionText, { color: currentTheme.text }]}>
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
            <View style={[styles.modalContent, { backgroundColor: currentTheme.surface }]}>
              <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
                Estado Civil
              </Text>
              {estadoCivilOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.modalOption}
                  onPress={() => handleSelectOption('estadoCivil', option)}
                >
                  <Text style={[styles.modalOptionText, { color: currentTheme.text }]}>
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
            <View style={[styles.modalContent, { backgroundColor: currentTheme.surface }]}>
              <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
                Sexo
              </Text>
              {sexoOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.modalOption}
                  onPress={() => handleSelectOption('sexo', option)}
                >
                  <Text style={[styles.modalOptionText, { color: currentTheme.text }]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Botões de Ação */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancelar}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.saveButton} onPress={handleSalvar}>
            <Text style={styles.saveButtonText}>Salvar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    fontWeight: '700',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginBottom: 24,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  formContainer: {
    gap: 16,
  },
  fullWidth: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  halfWidth: {
    flex: 1,
  },
  thirdWidth: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
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
    fontWeight: '600',
  },
  cepRow: {
    flexDirection: 'row',
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
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buscarButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  uploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 12,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  uploadSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  uploadButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  comingSoon: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 40,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    paddingTop: 32,
    paddingBottom: 24,
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#8A9E8E', // Verde institucional da Prefeitura de Jambeiro
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    textAlignVertical: 'top',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 12,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 4,
  },
  modalOptionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  required: {
    color: '#8A9E8E', // Verde institucional da Prefeitura de Jambeiro
    fontWeight: '600',
  },
  // 💊 Estilos para os novos componentes de medicamentos
  medicamentoSearchContainer: {
    marginBottom: 12,
    zIndex: 1000, // Para o dropdown ficar por cima
  },
  medicamentoTagsContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    minHeight: 60,
  },
});
