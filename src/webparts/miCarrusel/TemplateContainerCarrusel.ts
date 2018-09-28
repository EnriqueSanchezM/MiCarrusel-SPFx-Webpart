export default class TemplateContainerCarrusel {
    public static templateHtml: string =  `
    <div class="container">
        <div id="myCarouselWP" class="carousel slide" data-ride="carousel">
            <!-- Indicators -->
            <ol class="carousel-indicators" id="idCarouselIndicators">
                <!-- Aquí se inyectan los indicadores -->
            </ol>

            <!-- Wrapper for slides -->
            <div class="carousel-inner" role="listbox" id="idCarouselInner">
                <!-- Aquí se inyectan los resultados -->
            </div>
            
            <!-- Left and right controls -->
            <a class="left carousel-control" href="#myCarouselWP" role="button" data-slide="prev" id="idCarouselCtrlLeft">
                <span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
                <span class="sr-only">Previous</span>
            </a>
            <a class="right carousel-control" href="#myCarouselWP" role="button" data-slide="next" id="idCarouselCtrlRight">
                <span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>
                <span class="sr-only">Next</span>
            </a>
        </div>
    </div>`;


    public static templateHMLEmpty : string =  ` 
    <div class="container">
        <div class="jumbotron text-center">No se han encontrado noticias que mostrar</div>
    </div>`;
 }