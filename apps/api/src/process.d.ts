namespace NodeJS {
  interface ProcessEnv {
    readonly DB_FILE_NAME: string;
  }

  interface Process {
    readonly env: ProcessEnv;
  }
}
