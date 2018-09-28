import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';
import { escape } from '@microsoft/sp-lodash-subset';

import styles from './MiCarruselWebPart.module.scss';
import * as strings from 'MiCarruselWebPartStrings';

import TemplateContainerCarrusel from './TemplateContainerCarrusel';
import TemplateItemCarrusel from './TemplateItemCarrusel';

import * as jQuery from 'jquery';
import 'jqueryui';
import { SPComponentLoader } from '@microsoft/sp-loader';

import {
  SPHttpClient,
  SPHttpClientResponse   
 } from '@microsoft/sp-http';

import {
  Environment,
  EnvironmentType
 } from '@microsoft/sp-core-library';

import MockHttpClient from './MockHttpClient';


export interface IMiCarruselWebPartProps {
  description: string;
  paramListIntName: string;
  paramFilter: string;
  paramSelect: string;
  paramOrder: string;
  paramTop: string;
  defaultImgUrl: string;
}

export interface ISPListItems {
  value: ISPListItem[];
 }

 /**
  * Interface para definir los elementos del Carrusel
  */
 export interface ISPListItem {  
  Id: string;
  EncodedAbsUrl: string;
  LinkFilename : string;
  CarouselTitle : string;
  CarouselComments : string;
  CarouselOrder: string;
  CarouselImage:{Description:string, Url: string};
 }

 /**
  * Interface para definir los parámetros de la consulta REST a la biblioteca de páginas del carrusel
  */
 export interface IRenderCarruselParams {
  paramListIntName: string;
  paramFilter: string;
  paramSelect: string;
  paramOrder: string;
  paramTop: string;
  defaultImgUrl: string;
}

/**
 * Variable con los parámetros por defecto para la consulta de los elementos de Carrusel
 * Se utilizarán en caso de que los valores de las propiedades del WebPart estén vacíos
 */
var RenderCarruselParams: IRenderCarruselParams; 
RenderCarruselParams = {  
  paramListIntName: "CarouselPages",
  paramFilter:  "CarouselShow eq 1",
  paramSelect:  "Id,EncodedAbsUrl,LinkFilename,CarouselTitle,CarouselComments,CarouselOrder,CarouselImage",
  paramOrder:  "CarouselOrder asc",
  paramTop: "3",
  defaultImgUrl: "SiteAssets/CarouselImgs/No_image_photo.png"
};


/**
 * Clase Base para el WebPart del Carrusel
 */
export default class MiCarruselWebPart extends BaseClientSideWebPart<IMiCarruselWebPartProps> {
  /**
   * Constructor. Carga los CSS y JS necesarios
   */
  public constructor() {
    super(); 
    SPComponentLoader.loadCss('//code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.css');
    SPComponentLoader.loadCss('//maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css');
    SPComponentLoader.loadScript('//maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js');
    
  }
  
  /**
   * Desactiva la propiedad reactiva para que no se actualicen los cambios en las propiedades
   * del WebPart hasta que no se apliquen los cambios.
   */
  protected get disableReactivePropertyChanges(): boolean {
    return true;
  }
    
  /**
   * Método que pinta los elementos del Carrusel
   * @param items 
   */
  private _renderListItem(items: ISPListItem[]): void {
    let htmlItemsCol: string = '';
    let htmlItem: string = '';
    var i=0;
    var claseElemento = 'item';
    //Recogemos el template de un item de carrusel
    htmlItem = TemplateItemCarrusel.templateItemHtml;

    items.forEach((item: ISPListItem) => {
      if (i==0){
        claseElemento = 'item active';}
      else{
        claseElemento = 'item';
      }
      i++;     
      
      //Si la noticia no tiene imagen, cogemos la imagen por defecto
      var imageURL1 = RenderCarruselParams.defaultImgUrl;
      if (item.CarouselImage != null && item.CarouselImage.Url != "")
      {        
        imageURL1 = item.CarouselImage.Url;
      }
      var imageURL = "";
      if (imageURL1.startsWith('http'))
      {
        imageURL = imageURL1;
      }else
      {
        imageURL = this.context.pageContext.web.absoluteUrl + "/" + imageURL1;
      }
      let htmlItemReplaced: string = ''; 
      htmlItemReplaced = htmlItem.replace(/TOKEN0/g,item.Id).replace(/TOKEN1/g,item.CarouselTitle).replace(/TOKEN2/g,imageURL).replace(/TOKEN3/g, item.EncodedAbsUrl).replace(/TOKEN4/g, item.CarouselComments).replace(/TOKEN5/g,claseElemento);
      htmlItemsCol += htmlItemReplaced;          
    });
    
    if (i>0)
    {      
      let htmlIndicatorsCol: string = '';
      let htmlIndicator : string = '';
      let claseIndicador: string = '';
      htmlIndicator = TemplateItemCarrusel.templateIndicatorHtml;
      // Generamos dinámicamente los indicadores en función de los resultados obtenidos
      for(let n=0;n<i;n++)
      {
        if (n==0){claseIndicador='active';}
        else{claseIndicador='';}
        let htmlIndicatorReplaced = htmlIndicator.replace(/TOKEN0/g, n.toString()).replace(/TOKEN1/g, claseIndicador);
        htmlIndicatorsCol += htmlIndicatorReplaced;
      }

      //Cargamos el template del contenedor del Carrusel
      this.domElement.innerHTML = TemplateContainerCarrusel.templateHtml;

      const listContainer: Element = this.domElement.querySelector('#idCarouselInner');
      listContainer.innerHTML = htmlItemsCol;

      const indicatorsContainer: Element = this.domElement.querySelector ('#idCarouselIndicators');
      indicatorsContainer.innerHTML = htmlIndicatorsCol;
      
    }else{
      //Si no se encuentran elementos, se carga un div indicándolo
      //const wpContainer: Element = this.domElement.querySelector('#myCarouselWP');
      this.domElement.innerHTML = TemplateContainerCarrusel.templateHMLEmpty;      
    }
    
  }
  
  /**
   * Método que llama al método que pinte el carrusel en función del Environment (local/sharepoint)
   */
  private _renderListItemAsync(): void {    
    // Local environment
    if (Environment.type === EnvironmentType.Local) {
      this._getMockListData().then((response) => {
        this._renderListItem(response.value);
      });
    }
    else if (Environment.type == EnvironmentType.SharePoint || 
              Environment.type == EnvironmentType.ClassicSharePoint) {
      this._getListData()
        .then((response) => {
          this._renderListItem(response.value);
        });
    }
  }

  /**
   * Método que ejecuta la consulta a la biblioteca para devolver los elementos del carrusel
   */
  private _getListData(): Promise<ISPListItems> { 
    //Recogemos los parámetros para la consulta       
    if (typeof(this.properties.paramListIntName)!=="undefined")
    {
      if (this.properties.paramListIntName.trim()!="")
      {
        RenderCarruselParams.paramListIntName = this.properties.paramListIntName.trim();
      }      
    }    
    if (typeof(this.properties.paramFilter)!=="undefined")
    {
      if (this.properties.paramFilter.trim()!="")
      {
        RenderCarruselParams.paramFilter = this.properties.paramFilter.trim();
      }      
    }    
    if (typeof(this.properties.paramSelect)!=="undefined")
    {
      if (this.properties.paramSelect.trim()!="")
      {
        RenderCarruselParams.paramSelect = this.properties.paramSelect.trim();
      }      
    }    
    if (typeof(this.properties.paramOrder)!=="undefined")
    {
      if (this.properties.paramOrder.trim()!="")
      {
        RenderCarruselParams.paramOrder = this.properties.paramOrder.trim();
      }      
    }    
    if (typeof(this.properties.paramTop)!=="undefined")
    {
      if (this.properties.paramTop.trim()!="")
      {
        RenderCarruselParams.paramTop = this.properties.paramTop.trim();
      }      
    }
    if (typeof(this.properties.defaultImgUrl)!=="undefined")
    {
      if (this.properties.defaultImgUrl.trim()!="")
      {
        RenderCarruselParams.defaultImgUrl = this.properties.defaultImgUrl.trim();
      }      
    }

    console.log("CONSULTA:" + this.context.pageContext.web.absoluteUrl + "/_api/web/lists/" + RenderCarruselParams.paramListIntName + "/items?$filter=" + RenderCarruselParams.paramFilter + "&$select=" + RenderCarruselParams.paramSelect + "&$orderby=" + RenderCarruselParams.paramOrder + "&$top=" + RenderCarruselParams.paramTop);
    //Lanzamos la consulta
    return this.context.spHttpClient.get(this.context.pageContext.web.absoluteUrl + "/_api/web/lists/" + RenderCarruselParams.paramListIntName + "/items?$filter=" + RenderCarruselParams.paramFilter + "&$select=" + RenderCarruselParams.paramSelect + "&$orderby=" + RenderCarruselParams.paramOrder + "&$top=" + RenderCarruselParams.paramTop, SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        return response.json();
      });
   }
  
  /**
   * Método que obtiene los elementos del carrusel Mock (para entorno local)
   */
  private _getMockListData(): Promise<ISPListItems> {
    return MockHttpClient.get()
      .then((data: ISPListItem[]) => {
        var listData: ISPListItems = { value: data };
        return listData;
      }) as Promise<ISPListItems>;
  }

  /**
   * Método principal que ejecuta el proceso completo
   */
  public render(): void {
    //Cargamos el template del contenedor del Carrusel
    //this.domElement.innerHTML = TemplateContainerCarrusel.templateHtml;
    
    //Tengo que poner una instrucción de jQuery para que lo cargue. Pero no vale para nada   
    jQuery('#myCarouselWP').show();

    //Recogemos los elemntos de la biblioteca de páginas del carrusel
    this._renderListItemAsync();        
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                }),
                PropertyPaneTextField('paramListIntName', {
                  label: strings.ParamListFieldLabel
                }),
                PropertyPaneTextField('paramFilter', {
                  label: strings.ParamFilterFieldLabel
                }),
                PropertyPaneTextField('paramSelect', {
                  label: strings.ParamSelectFieldLabel 
                }),
                PropertyPaneTextField('paramOrder', {
                  label: strings.ParamOrderFieldLabel
                }),
                PropertyPaneTextField('paramTop', {
                  label: strings.ParamTopFieldLabel
                })
                ,
                PropertyPaneTextField('defaultImgUrl', {
                  label: strings.ParamDefaultImgFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
