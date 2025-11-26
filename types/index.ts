export interface ServerStatus {
  cpu: {
    usage: number;
  };
  memory: {
    used: number;
    total: number;
    usage: number;
  };
  uptime: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
  };
}

export interface DockerContainer {
  id: string;
  name: string;
  status: string;
  image: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  status: 'operational' | 'development' | 'experimental';
  link?: string;
  github?: string;
}

export interface Skill {
  category: string;
  items: string[];
}

