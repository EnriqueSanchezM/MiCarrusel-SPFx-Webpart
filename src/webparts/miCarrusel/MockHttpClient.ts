import { ISPListItem } from './MiCarruselWebPart';

export default class MockHttpClient  {
   private static _items: ISPListItem[] = [{ Id: '1', EncodedAbsUrl:'https://google.es', LinkFilename: 'Google 1', CarouselTitle: 'Mock List Item 1', CarouselComments: 'Lorem Ipsum', CarouselOrder: '1', CarouselImage:{Description:"Desc1", Url:'https://fortunedotcom.files.wordpress.com/2016/11/satya-nadella-2016-gettyimages-618305174.jpg'}},
                                       {  Id: '2', EncodedAbsUrl:'https://google.es', LinkFilename: 'Google 2', CarouselTitle: 'Mock List Item 2', CarouselComments: 'Lorem Ipsum', CarouselOrder: '2', CarouselImage: {Description:"Desc2", Url:'https://fortunedotcom.files.wordpress.com/2016/11/satya-nadella-2016-gettyimages-618305174.jpg'}},
                                       { Id: '3', EncodedAbsUrl:'https://google.es', LinkFilename: 'Google 3', CarouselTitle: 'Mock List Item 3', CarouselComments: 'Lorem Ipsum', CarouselOrder: '3', CarouselImage:{Description:"Desc3", Url:'https://fortunedotcom.files.wordpress.com/2016/11/satya-nadella-2016-gettyimages-618305174.jpg'}}];

   public static get(): Promise<ISPListItem[]> {
   return new Promise<ISPListItem[]>((resolve) => {
           resolve(MockHttpClient._items);
       });
   }
}