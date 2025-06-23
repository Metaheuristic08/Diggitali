import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';

const ItemGenerator = () => {
  const [userProfile, setUserProfile] = useState({
    edad: '',
    genero: '',
    pais: ''
  });

  const [evaluationRequirement, setEvaluationRequirement] = useState({
    competencia_id: '',
    nivel: '',
    tipo_pregunta: ''
  });

  const [generatedItem, setGeneratedItem] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Datos de referencia para las competencias DigComp 2.2
  const competencias = {
    '1.1': 'Navegación, búsqueda y filtrado de datos, información y contenidos digitales',
    '1.2': 'Evaluación de datos, información y contenidos digitales',
    '1.3': 'Gestión de datos, información y contenidos digitales',
    '2.1': 'Interacción mediante tecnologías digitales',
    '2.2': 'Compartir mediante tecnologías digitales',
    '2.3': 'Participación ciudadana mediante tecnologías digitales',
    '2.4': 'Colaboración mediante tecnologías digitales',
    '2.5': 'Netiqueta',
    '2.6': 'Gestión de la identidad digital',
    '3.1': 'Desarrollo de contenidos digitales',
    '3.2': 'Integración y reelaboración de contenidos digitales',
    '3.3': 'Derechos de autor y licencias',
    '3.4': 'Programación',
    '4.1': 'Protección de dispositivos',
    '4.2': 'Protección de datos personales y privacidad',
    '4.3': 'Protección de la salud y el bienestar',
    '4.4': 'Protección del medioambiente',
    '5.1': 'Resolución de problemas técnicos',
    '5.2': 'Identificación de necesidades y respuestas tecnológicas',
    '5.3': 'Uso creativo de la tecnología digital',
    '5.4': 'Identificación de lagunas en las competencias digitales'
  };

  const niveles = ['Básico 1', 'Básico 2', 'Intermedio 1', 'Intermedio 2', 'Avanzado 1', 'Avanzado 2'];
  const tiposPreguntas = ['alternativa_multiple', 'interactiva_pasos'];
  const paises = ['Chile', 'Argentina', 'Colombia', 'México', 'España', 'Perú', 'Ecuador', 'Uruguay'];
  const generos = ['Masculino', 'Femenino', 'Otro'];

  // Función para generar trámites relevantes por país
  const getTramitesPorPais = (pais) => {
    const tramites = {
      'Chile': [
        'solicitar certificado de nacimiento en Registro Civil',
        'agendar hora médica en FONASA',
        'consultar saldo en ChileAtiende',
        'renovar carnet de identidad',
        'solicitar certificado de antecedentes'
      ],
      'Argentina': [
        'gestionar DNI en RENAPER',
        'consultar ANSES',
        'solicitar certificado de AFIP',
        'agendar turno médico',
        'consultar padrón electoral'
      ],
      'Colombia': [
        'consultar SISBEN',
        'gestionar cédula en Registraduría',
        'solicitar certificado laboral',
        'consultar pensiones en Colpensiones',
        'agendar cita médica en EPS'
      ],
      'México': [
        'gestionar CURP',
        'consultar IMSS',
        'solicitar acta de nacimiento',
        'agendar cita en ISSSTE',
        'consultar RFC en SAT'
      ],
      'España': [
        'gestionar DNI electrónico',
        'consultar Seguridad Social',
        'solicitar certificado digital',
        'agendar cita médica',
        'consultar padrón municipal'
      ]
    };
    return tramites[pais] || tramites['Chile'];
  };

  // Función para generar instituciones por país
  const getInstitucionesPorPais = (pais) => {
    const instituciones = {
      'Chile': ['ChileAtiende', 'Registro Civil', 'FONASA', 'SII', 'Ministerio del Interior'],
      'Argentina': ['ANSES', 'RENAPER', 'AFIP', 'Ministerio de Salud', 'PAMI'],
      'Colombia': ['SISBEN', 'Registraduría', 'Colpensiones', 'MinSalud', 'DIAN'],
      'México': ['CURP', 'IMSS', 'ISSSTE', 'SAT', 'Secretaría de Salud'],
      'España': ['Sede Electrónica', 'Seguridad Social', 'FNMT', 'Sanidad', 'Hacienda']
    };
    return instituciones[pais] || instituciones['Chile'];
  };

  // Función principal para generar el ítem
  const generateItem = () => {
    setIsGenerating(true);
    
    // Simular tiempo de procesamiento
    setTimeout(() => {
      const tramites = getTramitesPorPais(userProfile.pais);
      const instituciones = getInstitucionesPorPais(userProfile.pais);
      const tramiteSeleccionado = tramites[Math.floor(Math.random() * tramites.length)];
      const institucionSeleccionada = instituciones[Math.floor(Math.random() * instituciones.length)];

      let item;

      if (evaluationRequirement.tipo_pregunta === 'alternativa_multiple') {
        item = generateMultipleChoiceItem(tramiteSeleccionado, institucionSeleccionada);
      } else {
        item = generateInteractiveItem(tramiteSeleccionado, institucionSeleccionada);
      }

      setGeneratedItem(item);
      setIsGenerating(false);
    }, 1500);
  };

  const generateMultipleChoiceItem = (tramite, institucion) => {
    const scenarios = {
      '1.1': `Necesitas ${tramite} y no sabes exactamente dónde hacerlo en línea. Tu ${userProfile.edad > 50 ? 'hijo/a' : 'amigo/a'} te dice que busques en internet, pero hay muchos sitios web diferentes.`,
      '4.2': `Estás intentando ${tramite} en línea y el sitio web te pide información personal como tu RUT y fecha de nacimiento. Te preocupa la seguridad de tus datos.`,
      '2.1': `Necesitas ${tramite} y encontraste el sitio oficial de ${institucion}, pero la página tiene muchas opciones y no sabes por dónde empezar.`
    };

    const options = {
      '1.1': [
        `Buscar "${tramite} ${institucion} oficial" en Google`,
        `Buscar "tramites" en Facebook`,
        `Preguntar en un grupo de WhatsApp`,
        `Esperar a que alguien te ayude`
      ],
      '4.2': [
        `Verificar que la URL comience con "https://" y sea del sitio oficial de ${institucion}`,
        `Ingresar los datos en cualquier sitio que aparezca primero en Google`,
        `Enviar los datos por WhatsApp a un conocido`,
        `Llamar por teléfono para dar los datos`
      ],
      '2.1': [
        `Buscar un menú o sección que diga "Ciudadanos" o "Trámites en línea"`,
        `Hacer clic en el primer enlace que veas`,
        `Cerrar la página y intentar más tarde`,
        `Llamar por teléfono en lugar de usar el sitio web`
      ]
    };

    const correctAnswers = { '1.1': 0, '4.2': 0, '2.1': 0 };
    const feedbacks = {
      '1.1': {
        correct: "¡Excelente! Usar términos específicos y buscar el sitio oficial es la mejor estrategia.",
        incorrect: "Recuerda que es importante buscar fuentes oficiales y usar términos específicos en tu búsqueda."
      },
      '4.2': {
        correct: "¡Muy bien! Verificar la seguridad del sitio web es fundamental para proteger tus datos.",
        incorrect: "Es importante verificar siempre que estés en un sitio seguro y oficial antes de ingresar datos personales."
      },
      '2.1': {
        correct: "¡Correcto! Buscar secciones específicas para ciudadanos es la forma más eficiente de navegar.",
        incorrect: "Intenta buscar secciones específicas como 'Ciudadanos' o 'Trámites' para encontrar lo que necesitas más fácilmente."
      }
    };

    return {
      type: "multiple-choice",
      competence: evaluationRequirement.competencia_id,
      level: evaluationRequirement.nivel,
      title: `Búsqueda de información para ${tramite}`,
      scenario: scenarios[evaluationRequirement.competencia_id] || scenarios['1.1'],
      options: options[evaluationRequirement.competencia_id] || options['1.1'],
      correctAnswerIndex: correctAnswers[evaluationRequirement.competencia_id] || 0,
      feedback: feedbacks[evaluationRequirement.competencia_id] || feedbacks['1.1']
    };
  };

  const generateInteractiveItem = (tramite, institucion) => {
    const scenarios = {
      '1.1': `Necesitas ${tramite} y decides buscar información en línea. Tienes tu computador abierto y estás listo para comenzar la búsqueda.`,
      '4.1': `Estás intentando ${tramite} en línea, pero tu computador está funcionando lento y aparecen ventanas emergentes extrañas.`,
      '2.1': `Encontraste el sitio web oficial de ${institucion} para ${tramite}, pero necesitas navegar por varios pasos para completar el proceso.`
    };

    const steps = {
      '1.1': [
        {
          id: 1,
          description: "¿Qué harás primero para buscar información sobre este trámite?",
          options: [
            "Abrir Google y buscar términos específicos",
            "Preguntar en redes sociales",
            "Llamar por teléfono directamente"
          ],
          correctAction: "Abrir Google y buscar términos específicos"
        },
        {
          id: 2,
          description: "¿Qué términos usarás en tu búsqueda?",
          options: [
            `"${tramite} ${institucion} oficial"`,
            "tramites gobierno",
            "ayuda documentos"
          ],
          correctAction: `"${tramite} ${institucion} oficial"`
        }
      ],
      '4.1': [
        {
          id: 1,
          description: "¿Cuál es tu primera acción ante esta situación?",
          options: [
            "Cerrar las ventanas emergentes sin hacer clic en ellas",
            "Hacer clic en las ventanas para ver qué dicen",
            "Continuar con el trámite ignorando las ventanas"
          ],
          correctAction: "Cerrar las ventanas emergentes sin hacer clic en ellas"
        },
        {
          id: 2,
          description: "¿Qué harás para mejorar el rendimiento de tu computador?",
          options: [
            "Cerrar programas innecesarios y verificar antivirus",
            "Reiniciar el computador varias veces",
            "Continuar trabajando sin hacer cambios"
          ],
          correctAction: "Cerrar programas innecesarios y verificar antivirus"
        }
      ]
    };

    return {
      type: "interactive",
      competence: evaluationRequirement.competencia_id,
      level: evaluationRequirement.nivel,
      title: `Proceso interactivo para ${tramite}`,
      scenario: scenarios[evaluationRequirement.competencia_id] || scenarios['1.1'],
      steps: steps[evaluationRequirement.competencia_id] || steps['1.1']
    };
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(generatedItem, null, 2));
  };

  const downloadJSON = () => {
    const dataStr = JSON.stringify(generatedItem, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `item_${evaluationRequirement.competencia_id}_${evaluationRequirement.nivel.replace(' ', '_')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #E3F2FD 0%, #BBDEFB 100%)',
      py: 4
    }}>
      <Container maxWidth="lg">
        <Box sx={{ 
          position: 'absolute', 
          top: 20, 
          left: 20,
          zIndex: 1,
          '& img': {
            height: '80px',
            filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))'
          }
        }}>
          <img src="/img/ladico.png" alt="LADICO Logo" />
        </Box>

        <Paper elevation={3} sx={{ p: 4, mt: 6 }}>
          <Typography variant="h4" gutterBottom align="center" color="primary">
            Generador de Ítems Evaluativos DigComp 2.2
          </Typography>
          
          <Typography variant="body1" paragraph align="center" color="text.secondary">
            Herramienta especializada para crear ítems evaluativos de competencias digitales
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Perfil del Usuario
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      label="Edad"
                      type="number"
                      value={userProfile.edad}
                      onChange={(e) => setUserProfile({...userProfile, edad: e.target.value})}
                      fullWidth
                      inputProps={{ min: 16, max: 100 }}
                    />
                    
                    <FormControl fullWidth>
                      <InputLabel>Género</InputLabel>
                      <Select
                        value={userProfile.genero}
                        onChange={(e) => setUserProfile({...userProfile, genero: e.target.value})}
                        label="Género"
                      >
                        {generos.map((genero) => (
                          <MenuItem key={genero} value={genero}>{genero}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    
                    <FormControl fullWidth>
                      <InputLabel>País</InputLabel>
                      <Select
                        value={userProfile.pais}
                        onChange={(e) => setUserProfile({...userProfile, pais: e.target.value})}
                        label="País"
                      >
                        {paises.map((pais) => (
                          <MenuItem key={pais} value={pais}>{pais}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Requisitos de Evaluación
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel>Competencia DigComp 2.2</InputLabel>
                      <Select
                        value={evaluationRequirement.competencia_id}
                        onChange={(e) => setEvaluationRequirement({...evaluationRequirement, competencia_id: e.target.value})}
                        label="Competencia DigComp 2.2"
                      >
                        {Object.entries(competencias).map(([id, descripcion]) => (
                          <MenuItem key={id} value={id}>
                            <Box>
                              <Typography variant="body2" fontWeight="bold">{id}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {descripcion}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    
                    <FormControl fullWidth>
                      <InputLabel>Nivel</InputLabel>
                      <Select
                        value={evaluationRequirement.nivel}
                        onChange={(e) => setEvaluationRequirement({...evaluationRequirement, nivel: e.target.value})}
                        label="Nivel"
                      >
                        {niveles.map((nivel) => (
                          <MenuItem key={nivel} value={nivel}>{nivel}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    
                    <FormControl fullWidth>
                      <InputLabel>Tipo de Pregunta</InputLabel>
                      <Select
                        value={evaluationRequirement.tipo_pregunta}
                        onChange={(e) => setEvaluationRequirement({...evaluationRequirement, tipo_pregunta: e.target.value})}
                        label="Tipo de Pregunta"
                      >
                        {tiposPreguntas.map((tipo) => (
                          <MenuItem key={tipo} value={tipo}>
                            {tipo === 'alternativa_multiple' ? 'Alternativa Múltiple' : 'Interactiva por Pasos'}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={generateItem}
              disabled={!userProfile.edad || !userProfile.genero || !userProfile.pais || 
                       !evaluationRequirement.competencia_id || !evaluationRequirement.nivel || 
                       !evaluationRequirement.tipo_pregunta || isGenerating}
              sx={{ px: 4, py: 1.5 }}
            >
              {isGenerating ? 'Generando Ítem...' : 'Generar Ítem Evaluativo'}
            </Button>
          </Box>

          {generatedItem && (
            <Box sx={{ mt: 4 }}>
              <Divider sx={{ my: 3 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" color="primary">
                  Ítem Generado
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<ContentCopyIcon />}
                    onClick={copyToClipboard}
                    size="small"
                  >
                    Copiar JSON
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={downloadJSON}
                    size="small"
                  >
                    Descargar JSON
                  </Button>
                </Box>
              </Box>

              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Typography variant="subtitle1">Vista Previa del Ítem</Typography>
                    <Chip 
                      label={generatedItem.type === 'multiple-choice' ? 'Alternativa Múltiple' : 'Interactiva'} 
                      size="small" 
                      color="primary" 
                    />
                    <Chip 
                      label={`Competencia ${generatedItem.competence}`} 
                      size="small" 
                      variant="outlined" 
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom>{generatedItem.title}</Typography>
                    <Typography variant="body1" paragraph>{generatedItem.scenario}</Typography>
                    
                    {generatedItem.type === 'multiple-choice' ? (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>Opciones:</Typography>
                        {generatedItem.options.map((option, index) => (
                          <Typography 
                            key={index} 
                            variant="body2" 
                            sx={{ 
                              ml: 2, 
                              color: index === generatedItem.correctAnswerIndex ? 'success.main' : 'text.primary',
                              fontWeight: index === generatedItem.correctAnswerIndex ? 'bold' : 'normal'
                            }}
                          >
                            {String.fromCharCode(65 + index)}. {option}
                            {index === generatedItem.correctAnswerIndex && ' ✓'}
                          </Typography>
                        ))}
                      </Box>
                    ) : (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>Pasos Interactivos:</Typography>
                        {generatedItem.steps.map((step, index) => (
                          <Box key={step.id} sx={{ ml: 2, mb: 2 }}>
                            <Typography variant="body2" fontWeight="bold">
                              Paso {step.id}: {step.description}
                            </Typography>
                            {step.options.map((option, optIndex) => (
                              <Typography 
                                key={optIndex} 
                                variant="body2" 
                                sx={{ 
                                  ml: 2, 
                                  color: option === step.correctAction ? 'success.main' : 'text.secondary',
                                  fontWeight: option === step.correctAction ? 'bold' : 'normal'
                                }}
                              >
                                • {option} {option === step.correctAction && ' ✓'}
                              </Typography>
                            ))}
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">Código JSON Completo</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ 
                    bgcolor: 'grey.100', 
                    p: 2, 
                    borderRadius: 1, 
                    overflow: 'auto',
                    maxHeight: '400px'
                  }}>
                    <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                      {JSON.stringify(generatedItem, null, 2)}
                    </pre>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default ItemGenerator;

