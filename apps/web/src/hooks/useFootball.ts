import { useQuery, useMutation, gql } from '@apollo/client';

// ============== TEAMS ==============

const GET_TEAMS = gql`
  query GetTeams {
    teams {
      id
      name
      logo
      formation
      tacticalStyle
      players {
        id
      }
    }
  }
`;

const CREATE_TEAM = gql`
  mutation CreateTeam($input: CreateTeamInput!) {
    createTeam(input: $input) {
      id
      name
      formation
      tacticalStyle
    }
  }
`;

export function useTeams() {
  const { data, loading, error, refetch } = useQuery(GET_TEAMS);

  return {
    teams: data?.teams || [],
    loading,
    error,
    refetch,
  };
}

export function useCreateTeam() {
  const [createTeam, { loading, error }] = useMutation(CREATE_TEAM, {
    refetchQueries: [{ query: GET_TEAMS }],
  });

  return {
    createTeam: (input: any) => createTeam({ variables: { input } }),
    loading,
    error,
  };
}

// ============== MATCHES ==============

const GET_MATCHES = gql`
  query GetMatches($teamId: ID) {
    matches(teamId: $teamId) {
      id
      date
      status
      homeScore
      awayScore
      homeTeam {
        id
        name
      }
      awayTeam {
        id
        name
      }
      homeFormation
      awayFormation
      analyses {
        id
      }
    }
  }
`;

const GET_MATCH = gql`
  query GetMatch($id: ID!) {
    match(id: $id) {
      id
      date
      venue
      competition
      status
      homeScore
      awayScore
      homeFormation
      awayFormation
      homeTeam {
        id
        name
        logo
        tacticalStyle
      }
      awayTeam {
        id
        name
        logo
        tacticalStyle
      }
      statistics {
        possession { home away }
        shots { home away }
        shotsOnTarget { home away }
        passes { home away }
        passAccuracy { home away }
      }
      environment {
        temperature
        humidity
        weather
        pitchCondition
      }
      analyses {
        id
        analysisType
        createdAt
      }
    }
  }
`;

const CREATE_MATCH = gql`
  mutation CreateMatch($input: CreateMatchInput!) {
    createMatch(input: $input) {
      id
      date
      homeTeam { name }
      awayTeam { name }
    }
  }
`;

export function useMatches(teamId?: string) {
  const { data, loading, error, refetch } = useQuery(GET_MATCHES, {
    variables: { teamId },
  });

  return {
    matches: data?.matches || [],
    loading,
    error,
    refetch,
  };
}

export function useMatch(matchId: string) {
  const { data, loading, error, refetch } = useQuery(GET_MATCH, {
    variables: { id: matchId },
    skip: !matchId,
  });

  return {
    match: data?.match,
    loading,
    error,
    refetch,
  };
}

export function useCreateMatch() {
  const [createMatch, { loading, error }] = useMutation(CREATE_MATCH, {
    refetchQueries: [{ query: GET_MATCHES }],
  });

  return {
    createMatch: (input: any) => createMatch({ variables: { input } }),
    loading,
    error,
  };
}

// ============== ANALYSIS ==============

const GET_ANALYSIS = gql`
  query GetAnalysis($id: ID!) {
    analysis(id: $id) {
      id
      analysisType
      summary
      recommendations
      createdAt
      match {
        id
        homeTeam { name }
        awayTeam { name }
      }
      risks {
        type
        severity
        description
      }
      opportunities {
        type
        potential
        description
        suggestedAction
      }
      patterns {
        id
        name
        type
        category
        effectiveness
        frequency
        description
      }
      predictions {
        id
        predictionType
        confidence
        prediction
      }
    }
  }
`;

const ANALYZE_MATCH = gql`
  mutation AnalyzeMatch($input: AnalyzeMatchInput!) {
    analyzeMatch(input: $input) {
      id
      analysisType
      summary
      recommendations
    }
  }
`;

export function useAnalysis(analysisId: string) {
  const { data, loading, error, refetch } = useQuery(GET_ANALYSIS, {
    variables: { id: analysisId },
    skip: !analysisId,
  });

  return {
    analysis: data?.analysis,
    loading,
    error,
    refetch,
  };
}

export function useAnalyzeMatch() {
  const [analyzeMatch, { loading, error, data }] = useMutation(ANALYZE_MATCH);

  return {
    analyzeMatch: (input: any) => analyzeMatch({ variables: { input } }),
    loading,
    error,
    analysis: data?.analyzeMatch,
  };
}

// ============== TRAINING ==============

const GET_TRAINING_PLANS = gql`
  query GetTrainingPlans($teamId: ID) {
    trainingPlans(teamId: $teamId) {
      id
      title
      description
      targetDate
      duration
      focus
      difficulty
      status
      team {
        name
      }
      exercises {
        name
        duration
        type
      }
    }
  }
`;

const GENERATE_TRAINING = gql`
  mutation GenerateTraining($input: GenerateTrainingInput!) {
    generateTraining(input: $input) {
      id
      title
      description
      exercises {
        name
        description
        duration
      }
      crossSportInnovation {
        sport
        drill
        expectedBenefit
      }
    }
  }
`;

export function useTrainingPlans(teamId?: string) {
  const { data, loading, error, refetch } = useQuery(GET_TRAINING_PLANS, {
    variables: { teamId },
  });

  return {
    trainingPlans: data?.trainingPlans || [],
    loading,
    error,
    refetch,
  };
}

export function useGenerateTraining() {
  const [generateTraining, { loading, error, data }] = useMutation(GENERATE_TRAINING, {
    refetchQueries: [{ query: GET_TRAINING_PLANS }],
  });

  return {
    generateTraining: (input: any) => generateTraining({ variables: { input } }),
    loading,
    error,
    trainingPlan: data?.generateTraining,
  };
}

// ============== PLAYERS ==============

const GET_PLAYERS = gql`
  query GetPlayers($teamId: ID) {
    players(teamId: $teamId) {
      id
      name
      position
      jerseyNumber
      age
      nationality
      currentFitness
      fatigue
      team {
        id
        name
      }
    }
  }
`;

const CREATE_PLAYER = gql`
  mutation CreatePlayer($input: CreatePlayerInput!) {
    createPlayer(input: $input) {
      id
      name
      position
    }
  }
`;

export function usePlayers(teamId?: string) {
  const { data, loading, error, refetch } = useQuery(GET_PLAYERS, {
    variables: { teamId },
  });

  return {
    players: data?.players || [],
    loading,
    error,
    refetch,
  };
}

export function useCreatePlayer() {
  const [createPlayer, { loading, error }] = useMutation(CREATE_PLAYER, {
    refetchQueries: [{ query: GET_PLAYERS }],
  });

  return {
    createPlayer: (input: any) => createPlayer({ variables: { input } }),
    loading,
    error,
  };
}
