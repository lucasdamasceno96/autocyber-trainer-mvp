package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"path/filepath"
	"runtime"
	"strings"

	_ "github.com/mattn/go-sqlite3"
)

var db *sql.DB

// --- ESTRUTURAS DE DADOS ---
type User struct {
	Nickname string `json:"nickname"`
}

type ScoreSubmission struct {
	Nickname string `json:"nickname"`
	Score    int    `json:"score"`
}

// --- INICIALIZAÇÃO DO BANCO DE DADOS ---
func initDB(dbPath string) {
	var err error
	db, err = sql.Open("sqlite3", dbPath)
	if err != nil {
		log.Fatalf("Falha CRÍTICA ao abrir o banco de dados: %v", err)
	}

	statement, err := db.Prepare(`
		CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			nickname TEXT NOT NULL UNIQUE,
			final_score INTEGER
		)
	`)
	if err != nil {
		log.Fatalf("Falha CRÍTICA ao preparar a criação da tabela: %v", err)
	}
	statement.Exec()
	log.Println("Banco de dados inicializado com sucesso em:", dbPath)
}

// --- HANDLERS DA API (COM CORREÇÃO DE ERRO) ---
func registerUserHandler(w http.ResponseWriter, r *http.Request) {
	var user User
	json.NewDecoder(r.Body).Decode(&user)

	// CORRIGIDO: Agora verificamos o erro de 'Prepare'
	statement, err := db.Prepare("INSERT OR IGNORE INTO users (nickname, final_score) VALUES (?, 0)")
	if err != nil {
		log.Printf("ERRO ao preparar statement de registro: %v", err)
		http.Error(w, "Erro interno do servidor", http.StatusInternalServerError)
		return
	}
	defer statement.Close() // Boa prática: fechar o statement quando a função terminar

	_, err = statement.Exec(user.Nickname)
	if err != nil {
		log.Printf("ERRO ao executar statement de registro: %v", err)
		http.Error(w, "Erro interno do servidor", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}

func saveScoreHandler(w http.ResponseWriter, r *http.Request) {
	var submission ScoreSubmission
	json.NewDecoder(r.Body).Decode(&submission)

	// CORRIGIDO: Agora verificamos o erro de 'Prepare'
	statement, err := db.Prepare("UPDATE users SET final_score = ? WHERE nickname = ?")
	if err != nil {
		log.Printf("ERRO ao preparar statement de salvar pontuação: %v", err)
		http.Error(w, "Erro interno do servidor", http.StatusInternalServerError)
		return
	}
	defer statement.Close()

	_, err = statement.Exec(submission.Score, submission.Nickname)
	if err != nil {
		log.Printf("ERRO ao executar statement de salvar pontuação: %v", err)
		http.Error(w, "Erro interno do servidor", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "score saved"})
}

// --- FUNÇÃO PRINCIPAL ---
func main() {
	_, b, _, _ := runtime.Caller(0)
	projectRoot := filepath.Dir(filepath.Dir(b))
	frontendPath := filepath.Join(projectRoot, "frontend")
	dbPath := filepath.Join(projectRoot, "backend", "gamedata.db")

	initDB(dbPath)
	defer db.Close()

	http.HandleFunc("/api/register", registerUserHandler)
	http.HandleFunc("/api/save-score", saveScoreHandler)

	fs := http.FileServer(http.Dir(frontendPath))
	http.Handle("/", http.StripPrefix(strings.TrimRight("/", ""), fs))

	log.Println("Servindo frontend da pasta:", frontendPath)
	log.Println("Servidor Go iniciado. Acesse em http://localhost:8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal("Falha ao iniciar o servidor:", err)
	}
}
