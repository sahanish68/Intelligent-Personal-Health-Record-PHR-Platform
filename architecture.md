# SmartPHR System Architecture Diagram

This diagram visualizes the actual system flow extracted from the codebase and README, including the requested Secure Envelope Encryption layer.

## Architecture Diagram

```mermaid
flowchart TD
    %% -- Global Styling to match Google Cloud's clean, modern look --
    classDef default fill:#ffffff,stroke:#dadce0,stroke-width:1.5px,color:#3c4043,font-family:Inter;
    classDef layerBox fill:#f8f9fa,stroke:#1a73e8,stroke-width:2px,stroke-dasharray: 4 4,font-weight:bold,color:#1a73e8;
    classDef clientBox fill:#e8eaed,stroke:#80868b,stroke-width:1px;
    classDef frontendBox fill:#e3f2fd,stroke:#1976d2,stroke-width:1.5px;
    classDef backendBox fill:#e6f4ea,stroke:#1e8e3e,stroke-width:1.5px;
    classDef aiBox fill:#f3e8ff,stroke:#9333ea,stroke-width:1.5px;
    classDef securityBox fill:#fff3e0,stroke:#f57c00,stroke-width:2px,color:#d84315,font-weight:bold;
    classDef dbBox fill:#fce8e6,stroke:#d93025,stroke-width:1.5px;

    %% ----------------------------------------------------
    %% CLIENT LAYER
    %% ----------------------------------------------------
    subgraph Client ["Client Layer (User Devices)"]
        direction LR
        Browser["<img src='https://cdn.jsdelivr.net/gh/devicons/devicon/icons/chrome/chrome-original.svg' width='25' /> <br/> Web Browser"]
        Smartwatch["<img src='https://cdn.jsdelivr.net/gh/devicons/devicon/icons/android/android-original.svg' width='25' /> <br/> Smartwatch<br/>(WearOS / Google Fit)"]
    end
    class Client layerBox;
    class Browser,Smartwatch clientBox;

    %% ----------------------------------------------------
    %% FRONTEND LAYER
    %% ----------------------------------------------------
    subgraph Frontend ["Frontend Layer"]
        ReactUI["<img src='https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' width='25' /> <br/> React.js (Vite) UI<br/>(SmartPHR Dashboard, NLP Agents, Body Map)"]
    end
    class Frontend layerBox;
    class ReactUI frontendBox;

    %% ----------------------------------------------------
    %% CLOUD INFRASTRUCTURE (GCP / CLOUD RUN)
    %% ----------------------------------------------------
    subgraph GCP ["☁️ Cloud Infrastructure Layer (Google Cloud Run)"]
        direction TB

        %% BACKEND API
        subgraph BackendLayer ["Backend Layer (backend-main)"]
            NodeAPI["<img src='https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg' width='25' /> <br/> Node.js / Express API<br/>User Management, OAuth, Wearable Sync"]
            
            %% SECURITY ENVELOPE ENCRYPTION
            subgraph SecurityLayer ["🔒 Secure Envelope Encryption Layer"]
                direction TB
                UserData["User Data Input"]
                FieldEnc["Field Encryption (AES-256)"]
                DEK["Data Encryption Key (DEK)"]
                KEK["Master Key (KEK)"]
                
                UserData -->|Raw Data| FieldEnc
                FieldEnc -->|Encrypts Data| DEK
                DEK -->|Encrypted via| KEK
            end
            
            NodeAPI -->|Passes sensitive auth/records| UserData
        end

        %% AI AGENT
        subgraph AILayer ["AI / Agent Layer (backend-ai)"]
            FastAPI["<img src='https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg' width='25' /> <br/> FastAPI Server (Python)<br/>Report Scanners & Symptom Extractor"]
            Gemini["<img src='https://cdn.jsdelivr.net/gh/devicons/devicon/icons/googlecloud/googlecloud-original.svg' width='25' /> <br/> Google Gemini 1.5 Flash Vision"]
            TTS["<img src='https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' width='25' /> <br/> NLP / gTTS Engine"]
            
            FastAPI <-->|Multimodal Prompts| Gemini
            FastAPI -->|Audio Generation| TTS
        end

        %% DATABASE
        subgraph Database ["Database Layer"]
            MongoDB["<img src='https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg' width='25' /> <br/> MongoDB Atlas<br/>Encrypted Vault"]
        end
    end
    
    class GCP,BackendLayer,AILayer,Database layerBox;
    class NodeAPI backendBox;
    class FastAPI,Gemini,TTS aiBox;
    class SecurityLayer,UserData,FieldEnc,DEK,KEK securityBox;
    class MongoDB dbBox;

    %% ----------------------------------------------------
    %% DATA FLOW MAPPINGS
    %% ----------------------------------------------------
    Browser <-->|HTTP/REST / UI rendering| ReactUI
    Smartwatch -->|Google Fit Sync| NodeAPI
    
    ReactUI <-->|API Calls / Authentication| NodeAPI
    ReactUI <-->|Upload Scans / Audio| FastAPI
    
    NodeAPI <-->|Cross-References active meds / history| FastAPI
    
    SecurityLayer -->|Stores Encrypted Records| MongoDB
    MongoDB -->|Retrieves Encrypted Records| SecurityLayer

```
