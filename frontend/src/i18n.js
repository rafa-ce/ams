import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      header: {
        personalPortfolio: "Personal Portfolio",
        investmentManagement: "Investment Management",
        subtitle: "Track your fixed and variable income portfolio in real-time",
        refresh: "Refresh",
        add: "Add"
      },
      error: {
        apiConnection: "Error connecting to API:",
        checkApi: "Check if the API is running (dotnet run --project src/WebAPI)"
      },
      summary: {
        totalInvested: "Total Invested",
        currentValue: "Current Value",
        fixedIncome: "Fixed Income",
        variableIncome: "Variable Income",
        assets_one: "{{count}} asset",
        assets_other: "{{count}} assets",
        portfolioPercentage: "{{percentage}}% of portfolio",
        allocationTitle: "Portfolio Allocation"
      },
      addModal: {
        titleFixedIncome: "New Fixed Income",
        titleVariableIncome: "New Variable Income",
        editFixedIncome: "Edit Fixed Income",
        editVariableIncome: "Edit Variable Income",
        type: "Type",
        fixedIncome: "Fixed Income",
        variableIncome: "Variable Income",
        name: "Name",
        institution: "Institution",
        investedAmount: "Invested Amount",
        currentValue: "Current Value (Optional)",
        investmentDate: "Investment Date",
        category: "Category",
        ticker: "Ticker",
        shares: "Shares",
        currentPrice: "Current Price",
        cancel: "Cancel",
        save: "Save",
        saving: "Saving...",
        update: "Update",
        updating: "Updating..."
      },
      table: {
        search: "Search investments...",
        allTypes: "All Types",
        fixedIncome: "Fixed Income",
        variableIncome: "Variable Income",
        asset: "Asset / Type",
        institution: "Institution / Date",
        invested: "Invested / Avg Price",
        current: "Current / Price",
        return: "Return",
        actions: "Actions",
        empty: "No investments found.",
        deleteConfirm: "Are you sure you want to delete this investment?"
      },
      format: {
        fixedIncomeDetails: "{{type}} • {{indexer}}",
        variableIncomeDetails: "{{category}} • {{shares}} shares",
        avgPrice: "Avg P: {{price}}"
      }
    }
  },
  pt: {
    translation: {
      header: {
        personalPortfolio: "Carteira Pessoal",
        investmentManagement: "Gestão de Investimentos",
        subtitle: "Acompanhe sua carteira de renda fixa e variável em tempo real",
        refresh: "Atualizar",
        add: "Adicionar"
      },
      error: {
        apiConnection: "Erro ao conectar na API:",
        checkApi: "Verifique se a API está rodando (dotnet run --project src/WebAPI)"
      },
      summary: {
        totalInvested: "Total Aplicado",
        currentValue: "Valor Atual",
        fixedIncome: "Renda Fixa",
        variableIncome: "Renda Variável",
        assets_one: "{{count}} ativo",
        assets_other: "{{count}} ativos",
        portfolioPercentage: "{{percentage}}% da carteira",
        allocationTitle: "Alocação da Carteira"
      },
      addModal: {
        titleFixedIncome: "Nova Renda Fixa",
        titleVariableIncome: "Nova Renda Variável",
        editFixedIncome: "Editar Renda Fixa",
        editVariableIncome: "Editar Renda Variável",
        type: "Tipo",
        fixedIncome: "Renda Fixa",
        variableIncome: "Renda Variável",
        name: "Nome",
        institution: "Instituição",
        investedAmount: "Valor Aplicado",
        currentValue: "Valor Atual (Opcional)",
        investmentDate: "Data da Aplicação",
        category: "Categoria",
        ticker: "Ticker",
        shares: "Quantidade",
        currentPrice: "Cotação Atual",
        cancel: "Cancelar",
        save: "Salvar",
        saving: "Salvando...",
        update: "Atualizar",
        updating: "Atualizando..."
      },
      table: {
        search: "Buscar investimentos...",
        allTypes: "Todos os Tipos",
        fixedIncome: "Renda Fixa",
        variableIncome: "Renda Variável",
        asset: "Ativo / Tipo",
        institution: "Instituição / Data",
        invested: "Aplicado / Preço Méd",
        current: "Atual / Cotação",
        return: "Rendimento",
        actions: "Ações",
        empty: "Nenhum investimento encontrado.",
        deleteConfirm: "Tem certeza que deseja excluir este investimento?"
      },
      format: {
        fixedIncomeDetails: "{{type}} • {{indexer}}",
        variableIncomeDetails: "{{category}} • {{shares}} cotas",
        avgPrice: "PM: {{price}}"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
