# --- ESTÁGIO 1: Build do Backend Go ---
# Usamos uma imagem oficial do Go baseada no Alpine Linux, que é leve.
FROM golang:1.24-alpine AS builder

# Define o diretório de trabalho dentro do container.
WORKDIR /app

# Copia os arquivos de gerenciamento de módulos do Go.
COPY backend/go.mod backend/go.sum ./

# Baixa as dependências do Go.
RUN go mod download

# Copia todo o código do backend para o diretório de trabalho.
COPY backend/ ./

# Compila o código Go.
# CGO_ENABLED=0 cria um binário estático, que não depende de bibliotecas externas.
# -o app cria um arquivo de saída chamado 'app'.
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o app .


# --- ESTÁGIO 2: Imagem Final ---
# Começamos com uma imagem Alpine Linux, que é super leve (cerca de 5MB).
FROM alpine:latest

# Define o diretório de trabalho para a aplicação final.
WORKDIR /app

# Copia o executável 'app' que foi compilado no estágio 'builder'.
COPY --from=builder /app/app .

# Copia TODA a pasta 'frontend' para o diretório de trabalho.
# O nosso executável Go saberá encontrá-la aqui.
COPY frontend/ ./frontend/

# Expõe a porta 8080, que é a porta que nosso servidor Go escuta.
EXPOSE 8080

# Define o comando que será executado quando o container iniciar.
# Simplesmente executa nosso aplicativo compilado.
CMD ["./app"]