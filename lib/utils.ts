import { PriceHistoryItem, Product } from "@/types";


const Notification = {
  WELCOME: 'WELCOME',
  CHANGE_OF_STOCK: 'CHANGE_OF_STOCK',
  LOWEST_PRICE: 'LOWEST_PRICE',
  THRESHOLD_MET: 'THRESHOLD_MET',
}

const THRESHOLD_PERCENTAGE = 40;

// Extracts and returns the price from a list of possible elements.

export function extractPrice(...elements: any): number {
  for (const element of elements) {
    const priceText = element.text().trim();

    if(priceText) {
      const cleanPrice = parseFloat(priceText.replace(/[^\d.]/g, ''));

      let firstPrice; 

      if (cleanPrice) {
        firstPrice = parseFloat(cleanPrice.toFixed(2));
      } 

      return firstPrice || cleanPrice;
    }
  }

  return 0;
}

// Extracts and returns the currency symbol from an element.
export function extractCurrency(element: any): string {
  const currencyText = element.text().trim().slice(0, 1);
  return currencyText ? currencyText : "";
}

// Extracts description from two possible elements from amazon
export function extractDescription($: any) {
  // these are possible elements holding description of the product
  const selectors = [
    ".a-unordered-list .a-list-item",
    ".a-expander-content p",
    // Add more selectors here if needed
  ];

  for (const selector of selectors) {
    const elements = $(selector);
    if (elements.length > 0) {
      const textContent = elements
        .map((_: any, element: any) => $(element).text().trim())
        .get()
        .join("\n");
      return textContent;
    }
  }

  // If no matching elements were found, return an empty string
  return "";
}

export function getHighestPrice(priceList: PriceHistoryItem[]): number {
  let highestPrice = priceList[0].price;

  for (let i = 1; i < priceList.length; i++) {
    if (priceList[i].price > highestPrice) {
      highestPrice = priceList[i].price;
    }
  }

  return highestPrice;
}

export function getLowestPrice(priceList: PriceHistoryItem[]): number {
  let lowestPrice = priceList[0].price;

  for (let i = 1; i < priceList.length; i++) {
    if (priceList[i].price < lowestPrice) {
      lowestPrice = priceList[i].price;
    }
  }

  return lowestPrice;
}

export function getAveragePrice(priceList: PriceHistoryItem[]): number {
  const sumOfPrices = priceList.reduce((acc, curr) => acc + curr.price, 0);
  const averagePrice = sumOfPrices / priceList.length || 0;

  return parseFloat(averagePrice.toFixed(2));
}


export const getEmailNotifType = (
  scrapedProduct: Product,
  currentProduct: Product
) => {
  const lowestPrice = getLowestPrice(currentProduct.priceHistory);

  if (scrapedProduct.currentPrice < lowestPrice) {
    return Notification.LOWEST_PRICE as keyof typeof Notification;
  }
  if (!scrapedProduct.isOutOfStock && currentProduct.isOutOfStock) {
    return Notification.CHANGE_OF_STOCK as keyof typeof Notification;
  }
  if (scrapedProduct.discountRate >= THRESHOLD_PERCENTAGE) {
    return Notification.THRESHOLD_MET as keyof typeof Notification;
  }

  return null;
};

export const formatNumber = (num: number = 0): string => {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};