

// // screens/customer/ProductDetailsScreen.js

// import React, { useMemo, useState } from "react";
// import {
//   View,
//   Text,
//   Image,
//   ScrollView,
//   StyleSheet,
//   TouchableOpacity,
//   TextInput,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";

// import Header from "../../components/Header";
// import Button from "../../components/Button";
// import { COLORS } from "../../constants/colors";
// import { useShop } from "../../context/ShopContext";

// const placeholder = require("../../../assets/images/placeholder.png");

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// const getProductId = (product) => {
//   return String(product?.id || product?.name || Date.now());
// };

// /**
//  * Resolves an image value to something <Image source={...}> accepts.
//  * - require() returns a number  → pass as-is
//  * - URI string                  → wrap as { uri }
//  * - null / undefined            → use placeholder
//  */
// const resolveImageSource = (value) => {
//   if (!value) return placeholder;
//   if (typeof value === "number") return value;        // local require()
//   if (typeof value === "string") return { uri: value }; // remote / picked URI
//   if (typeof value === "object" && value.uri) return value; // already { uri }
//   return placeholder;
// };

// const getProductDetails = (product) => {
//   const type = product?.subcategory || product?.type || "Handmade Product";
//   return {
//     type,
//     size: product?.size || "Medium",
//     material: product?.material || "Handmade / Premium Quality",
//     color: product?.color || "As shown in image",
//     weight: product?.weight ? `${product.weight} kg` : "Approx 250g - 500g",
//     stock: product?.stock || "Available",
//     seller: product?.seller || product?.sellerName || "Bliss Handmade Store",
//     delivery: product?.delivery || "Delivery in 3 - 5 days",
//     returnPolicy: product?.returnPolicy || "7 days replacement available",
//     description:
//       product?.description ||
//       `${product?.name || "This product"} is carefully handmade with good quality material.`,
//   };
// };

// // ─── Image gallery helper ─────────────────────────────────────────────────────

// /**
//  * Build a list of image sources from a product.
//  * Handles both local require() (number) and URI string arrays.
//  */
// const buildGallery = (product) => {
//   // Prefer explicit images array
//   if (Array.isArray(product?.images) && product.images.length > 0) {
//     return product.images.map(resolveImageSource);
//   }
//   // Fallback to single image field
//   const main = resolveImageSource(product?.image);
//   return [main];
// };

// // ─── Screen ───────────────────────────────────────────────────────────────────

// export default function ProductDetailsScreen({ route, navigation }) {
//   const { addToCart, toggleWishlist, isInWishlist } = useShop();

//   const product = route?.params?.product || {};
//   const details = useMemo(() => getProductDetails(product), [product]);

//   // Build gallery from product.images[] or fall back to single image
//   const gallery = useMemo(() => buildGallery(product), [product]);

//   // frontImage / backImage for the tab view
//   const frontImage = resolveImageSource(
//     product?.frontImage || product?.image || gallery[0]
//   );
//   const backImage = resolveImageSource(
//     product?.backImage || product?.image || gallery[0]
//   );

//   const cartProduct = useMemo(
//     () => ({
//       ...product,
//       id: getProductId(product),
//       name: product?.name || "Product Name",
//       price: product?.price || "₹0",
//       rating: product?.rating || "4.8",
//       image: product?.image || null,
//       frontImage: product?.frontImage || product?.image || null,
//       backImage: product?.backImage || product?.image || null,
//       seller: details.seller,
//       qty: 1,
//     }),
//     [product, details.seller]
//   );

//   const [selectedView, setSelectedView] = useState("Front");
//   const [galleryIndex, setGalleryIndex] = useState(0);
//   const [message, setMessage] = useState("");
//   const [rating, setRating] = useState(0);
//   const [comment, setComment] = useState("");

//   const selectedImage = selectedView === "Front" ? frontImage : backImage;
//   const isWishlisted = isInWishlist(cartProduct.id);
//   const hasPurchased = route?.params?.hasPurchased || false;

//   const showMessage = (text) => {
//     setMessage(text);
//     setTimeout(() => setMessage(""), 1800);
//   };

//   const handleWishlist = () => {
//     toggleWishlist(cartProduct);
//     showMessage(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
//   };

//   // Add to cart with toast — does NOT navigate away
//   const handleAddToCart = () => {
//     addToCart(cartProduct);
//     showMessage(`"${cartProduct.name}" added to cart ✓`);
//   };

//   const handleBuyNow = () => {
//     navigation.navigate("Checkout", {
//       product: cartProduct,
//       cartItems: [cartProduct],
//       action: "buyNow",
//     });
//   };

//   const handleSubmitReview = () => {
//     if (!hasPurchased) {
//       showMessage("You can review only after buying.");
//       return;
//     }
//     if (rating === 0) {
//       showMessage("Please select your rating.");
//       return;
//     }
//     if (!comment.trim()) {
//       showMessage("Please write your comment.");
//       return;
//     }
//     showMessage("Review submitted successfully.");
//     setRating(0);
//     setComment("");
//   };

//   // Does this product have a second distinct back image?
//   const hasBackImage =
//     product?.backImage &&
//     String(product.backImage) !== String(product?.frontImage || product?.image);

//   // Show gallery thumbnails if product has multiple images
//   const showGallery = gallery.length > 1;

//   return (
//     <View style={styles.container}>
//       <Header
//         title="Product Details"
//         navigation={navigation}
//         color={COLORS.customer}
//       />

//       {/* Toast / message */}
//       {message ? (
//         <View style={styles.messageBox}>
//           <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
//           <Text style={styles.messageText}>{message}</Text>
//         </View>
//       ) : null}

//       <ScrollView showsVerticalScrollIndicator={false}>

//         {/* ── Image section ── */}
//         <View style={styles.imageBox}>
//           <View style={styles.imageFrame}>
//             <Image
//               source={showGallery ? gallery[galleryIndex] : selectedImage}
//               defaultSource={placeholder}
//               style={[
//                 styles.image,
//                 !showGallery && selectedView === "Back" && styles.backTurnImage,
//               ]}
//               resizeMode="contain"
//               fadeDuration={0}
//             />

//             {/* Wishlist button (top-left of image) */}
//             <TouchableOpacity
//               style={[styles.wishlistBtn, isWishlisted && styles.activeWishlistBtn]}
//               activeOpacity={0.85}
//               onPress={handleWishlist}
//             >
//               <Ionicons
//                 name={isWishlisted ? "heart" : "heart-outline"}
//                 size={24}
//                 color={isWishlisted ? "#FFFFFF" : COLORS.customer || "#E83E7C"}
//               />
//             </TouchableOpacity>

//             {/* View badge */}
//             <View style={styles.turnBadge}>
//               <Ionicons name="sync-outline" size={16} color="#fff" />
//               <Text style={styles.turnBadgeText}>
//                 {showGallery
//                   ? `${galleryIndex + 1} / ${gallery.length}`
//                   : `${selectedView} View`}
//               </Text>
//             </View>
//           </View>

//           {/* Gallery thumbnails */}
//           {showGallery ? (
//             <ScrollView
//               horizontal
//               showsHorizontalScrollIndicator={false}
//               contentContainerStyle={styles.galleryRow}
//             >
//               {gallery.map((src, idx) => (
//                 <TouchableOpacity
//                   key={idx}
//                   onPress={() => setGalleryIndex(idx)}
//                   style={[
//                     styles.thumbWrap,
//                     galleryIndex === idx && styles.activeThumbWrap,
//                   ]}
//                   activeOpacity={0.85}
//                 >
//                   <Image
//                     source={src}
//                     style={styles.thumb}
//                     resizeMode="cover"
//                     defaultSource={placeholder}
//                   />
//                 </TouchableOpacity>
//               ))}
//             </ScrollView>
//           ) : (
//             /* Front / Turn tabs for products with back image */
//             <View style={styles.viewTabs}>
//               <TouchableOpacity
//                 style={[styles.viewTab, selectedView === "Front" && styles.activeViewTab]}
//                 onPress={() => setSelectedView("Front")}
//               >
//                 <Ionicons
//                   name="image-outline"
//                   size={17}
//                   color={selectedView === "Front" ? "#fff" : COLORS.customer}
//                 />
//                 <Text
//                   style={[
//                     styles.viewTabText,
//                     selectedView === "Front" && styles.activeViewTabText,
//                   ]}
//                 >
//                   Front
//                 </Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={[styles.viewTab, selectedView === "Back" && styles.activeViewTab]}
//                 onPress={() => setSelectedView("Back")}
//               >
//                 <Ionicons
//                   name="reload-outline"
//                   size={17}
//                   color={selectedView === "Back" ? "#fff" : COLORS.customer}
//                 />
//                 <Text
//                   style={[
//                     styles.viewTabText,
//                     selectedView === "Back" && styles.activeViewTabText,
//                   ]}
//                 >
//                   Turn
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           )}
//         </View>

//         {/* ── Details card ── */}
//         <View style={styles.card}>
//           <View style={styles.titleRow}>
//             <View style={{ flex: 1 }}>
//               <Text style={styles.title}>{cartProduct.name}</Text>
//               <Text style={styles.seller}>Seller: {details.seller}</Text>

//               {/* Show category & subcategory if available */}
//               {(product?.category || product?.subcategory) ? (
//                 <Text style={styles.categoryTag}>
//                   {[product.category, product.subcategory]
//                     .filter(Boolean)
//                     .join(" › ")}
//                 </Text>
//               ) : null}
//             </View>

//             <TouchableOpacity
//               style={[styles.smallWishlistBtn, isWishlisted && styles.activeSmallWishlistBtn]}
//               activeOpacity={0.85}
//               onPress={handleWishlist}
//             >
//               <Ionicons
//                 name={isWishlisted ? "heart" : "heart-outline"}
//                 size={23}
//                 color={isWishlisted ? "#FFFFFF" : COLORS.customer || "#E83E7C"}
//               />
//             </TouchableOpacity>
//           </View>

//           <View style={styles.priceRow}>
//             <Text style={styles.price}>
//               {String(cartProduct.price || "").includes("₹")
//                 ? cartProduct.price
//                 : `₹${cartProduct.price || "0"}`}
//             </Text>
//             <Text style={styles.ratingText}>⭐ {cartProduct.rating}</Text>
//           </View>

//           <Text style={styles.sectionTitle}>Details</Text>

//           <View style={styles.detailsBox}>
//             <DetailRow label="Product Name" value={cartProduct.name} />
//             <DetailRow label="Type" value={details.type} />
//             <DetailRow label="Size" value={details.size} />
//             <DetailRow label="Material" value={details.material} />
//             <DetailRow label="Color" value={details.color} />
//             <DetailRow label="Weight" value={details.weight} />
//             <DetailRow label="Stock" value={details.stock} />
//             <DetailRow label="Delivery" value={details.delivery} />
//             <DetailRow label="Return" value={details.returnPolicy} />
//           </View>

//           <Text style={styles.sectionTitle}>Description</Text>
//           <Text style={styles.desc}>{details.description}</Text>

//           {/* Buttons */}
//           <View style={styles.buttonGap}>
//             <Button title="Add to Cart" onPress={handleAddToCart} />
//           </View>
//           <Button title="Buy Now" color={COLORS.orange} onPress={handleBuyNow} />
//         </View>

//         {/* ── Review section (only after purchase) ── */}
//         {hasPurchased && (
//           <View style={styles.reviewCard}>
//             <Text style={styles.sectionTitle}>Give Rating & Comment</Text>

//             <View style={styles.starRow}>
//               {[1, 2, 3, 4, 5].map((star) => (
//                 <TouchableOpacity key={star} onPress={() => setRating(star)}>
//                   <Ionicons
//                     name={star <= rating ? "star" : "star-outline"}
//                     size={31}
//                     color={COLORS.orange || "#F59E0B"}
//                   />
//                 </TouchableOpacity>
//               ))}
//             </View>

//             <TextInput
//               style={styles.commentInput}
//               placeholder="Write your comment after buying..."
//               placeholderTextColor="#9CA3AF"
//               multiline
//               value={comment}
//               onChangeText={setComment}
//             />

//             <TouchableOpacity
//               style={styles.submitReviewBtn}
//               onPress={handleSubmitReview}
//             >
//               <Text style={styles.submitReviewText}>Submit Rating & Comment</Text>
//             </TouchableOpacity>
//           </View>
//         )}

//         <View style={{ height: 110 }} />
//       </ScrollView>
//     </View>
//   );
// }

// // ─── DetailRow ────────────────────────────────────────────────────────────────

// function DetailRow({ label, value }) {
//   return (
//     <View style={styles.detailRow}>
//       <Text style={styles.detailLabel}>{label}</Text>
//       <Text style={styles.detailValue}>{value}</Text>
//     </View>
//   );
// }

// // ─── Styles ───────────────────────────────────────────────────────────────────

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#FFFFFF" },

//   messageBox: {
//     marginHorizontal: 16,
//     marginTop: 10,
//     padding: 12,
//     borderRadius: 14,
//     backgroundColor: "#111827",
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//   },

//   messageText: {
//     color: "#FFFFFF",
//     fontSize: 13,
//     fontWeight: "900",
//     flex: 1,
//   },

//   imageBox: { backgroundColor: "#fff", paddingBottom: 8 },

//   imageFrame: {
//     height: 370,
//     margin: 14,
//     borderRadius: 24,
//     backgroundColor: "#FFF4F8",
//     borderWidth: 1,
//     borderColor: "#F8C8D9",
//     alignItems: "center",
//     justifyContent: "center",
//     overflow: "hidden",
//     elevation: 4,
//   },

//   image: { width: "100%", height: "100%" },
//   backTurnImage: { transform: [{ scaleX: -1 }] },

//   wishlistBtn: {
//     position: "absolute",
//     top: 14,
//     left: 14,
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: "rgba(255,255,255,0.96)",
//     alignItems: "center",
//     justifyContent: "center",
//     elevation: 4,
//   },
//   activeWishlistBtn: { backgroundColor: COLORS.customer || "#082843" },

//   turnBadge: {
//     position: "absolute",
//     top: 14,
//     right: 14,
//     backgroundColor:  "#082843",
//     paddingHorizontal: 12,
//     paddingVertical: 7,
//     borderRadius: 20,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 5,
//   },
//   turnBadgeText: { color: "#fff", fontSize: 12, fontWeight: "900" },

//   // Gallery thumbnails
//   galleryRow: {
//     paddingHorizontal: 14,
//     gap: 10,
//     paddingBottom: 4,
//   },
//   thumbWrap: {
//     width: 60,
//     height: 60,
//     borderRadius: 12,
//     borderWidth: 2,
//     borderColor: "transparent",
//     overflow: "hidden",
//   },
//   activeThumbWrap: {
//     borderColor: "#082843",
//   },
//   thumb: {
//     width: "100%",
//     height: "100%",
//     backgroundColor: "#FFF4F8",
//   },

//   // Front / Turn tabs
//   viewTabs: {
//     flexDirection: "row",
//     paddingHorizontal: 14,
//     gap: 10,
//   },
//   viewTab: {
//     flex: 1,
//     height: 46,
//     borderRadius: 23,
//     borderWidth: 1,
//     borderColor:"#082843",
//     alignItems: "center",
//     justifyContent: "center",
//     flexDirection: "row",
//     gap: 6,
//     backgroundColor: "#fff",
//   },
//   activeViewTab: { backgroundColor: "#082843" },
//   viewTabText: {
//     fontSize: 13,
//     fontWeight: "900",
//     color: COLORS.customer || "#082843",
//   },
//   activeViewTabText: { color: "#fff" },

//   // Card
//   card: {
//     backgroundColor: "#fff",
//     margin: 16,
//     padding: 18,
//     borderRadius: 22,
//     elevation: 4,
//   },

//   titleRow: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     gap: 12,
//   },

//   smallWishlistBtn: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     borderWidth: 1,
//     borderColor: "#F8C8D9",
//     backgroundColor: "#FFF4F8",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   activeSmallWishlistBtn: {
//     backgroundColor: COLORS.customer || "#082843",
//     borderColor: COLORS.customer || "#082843",
//   },

//   title: {
//     fontSize: 24,
//     fontWeight: "900",
//     color: COLORS.text || "#111827",
//   },
//   seller: {
//     color: COLORS.muted || "#6B7280",
//     marginTop: 6,
//     fontWeight: "700",
//   },
//   categoryTag: {
//     marginTop: 4,
//     fontSize: 12,
//     fontWeight: "700",
//     color: COLORS.customer || "#E83E7C",
//   },

//   priceRow: {
//     marginTop: 10,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   price: {
//     fontSize: 24,
//     fontWeight: "900",
//     color: COLORS.customer || "#E83E7C",
//   },
//   ratingText: {
//     color: COLORS.orange || "#F59E0B",
//     fontWeight: "900",
//     fontSize: 15,
//   },

//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "900",
//     marginTop: 20,
//     marginBottom: 10,
//     color: COLORS.text || "#111827",
//   },

//   detailsBox: {
//     borderWidth: 1,
//     borderColor: "#F1E3EA",
//     borderRadius: 16,
//     overflow: "hidden",
//   },
//   detailRow: {
//     flexDirection: "row",
//     paddingVertical: 12,
//     paddingHorizontal: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "#F3F4F6",
//   },
//   detailLabel: {
//     width: "38%",
//     fontSize: 13,
//     fontWeight: "900",
//     color: COLORS.text || "#111827",
//   },
//   detailValue: {
//     flex: 1,
//     fontSize: 13,
//     fontWeight: "700",
//     color: COLORS.muted || "#6B7280",
//   },

//   desc: {
//     color: COLORS.muted || "#6B7280",
//     marginTop: 2,
//     lineHeight: 22,
//     fontWeight: "600",
//   },

//   buttonGap: { marginTop: 18, marginBottom: 10 },

//   reviewCard: {
//     backgroundColor: "#fff",
//     marginHorizontal: 16,
//     marginBottom: 40,
//     padding: 18,
//     borderRadius: 22,
//     elevation: 4,
//   },
//   starRow: {
//     flexDirection: "row",
//     gap: 8,
//     marginBottom: 14,
//   },
//   commentInput: {
//     minHeight: 95,
//     borderWidth: 1,
//     borderColor: "#F1E3EA",
//     borderRadius: 16,
//     padding: 12,
//     textAlignVertical: "top",
//     color: COLORS.text || "#111827",
//     fontWeight: "600",
//     backgroundColor: "#FFFBFC",
//   },
//   submitReviewBtn: {
//     height: 46,
//     borderRadius: 23,
//     backgroundColor: COLORS.customer || "#E83E7C",
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 12,
//   },
//   submitReviewText: {
//     color: "#fff",
//     fontSize: 15,
//     fontWeight: "900",
//   },
// });























import React, {
  useMemo,
  useState,
} from "react";

import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import Header from "../../components/Header";
import Button from "../../components/Button";

import { COLORS } from "../../constants/colors";

import { useShop } from "../../context/ShopContext";

const { width } = Dimensions.get("window");

const placeholder = require("../../../assets/images/placeholder.png");

const resolveImage = (img) => {

  if (!img) {
    return placeholder;
  }

  if (typeof img === "number") {
    return img;
  }

  if (typeof img === "string") {
    return { uri: img };
  }

  if (img?.uri) {
    return img;
  }

  return placeholder;
};

export default function ProductDetailsScreen({
  route,
  navigation,
}) {

  const {
    addToCart,
    toggleWishlist,
    isInWishlist,
  } = useShop();

  const product =
    route?.params?.product || {};

  const gallery = useMemo(() => {

    if (
      Array.isArray(product?.images) &&
      product.images.length > 0
    ) {
      return product.images;
    }

    return [product?.image];

  }, [product]);

  const [selectedImage, setSelectedImage] =
    useState(0);

  const wishlisted =
    isInWishlist?.(product.id);

  const handleAddToCart = () => {

    addToCart({
      ...product,
      qty: 1,
    });

  };

  const handleBuyNow = () => {

    navigation.navigate(
      "Checkout",
      {
        cartItems: [
          {
            ...product,
            qty: 1,
          },
        ],
      }
    );

  };

  return (
    <View style={styles.container}>

      <StatusBar
        backgroundColor="#fff"
        barStyle="dark-content"
      />

      <Header
        title="Product Details"
        navigation={navigation}
        color={COLORS.primary}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
      >

        {/* IMAGE SECTION */}
        <View style={styles.imageSection}>

          <Image
            source={resolveImage(
              gallery[selectedImage]
            )}
            style={styles.mainImage}
            resizeMode="contain"
          />

          {/* HEART */}
          <TouchableOpacity
            style={styles.heartBtn}
            activeOpacity={0.85}
            onPress={() =>
              toggleWishlist(product)
            }
          >
            <Ionicons
              name={
                wishlisted
                  ? "heart"
                  : "heart-outline"
              }
              size={24}
              color={
                wishlisted
                  ? "#fff"
                  : COLORS.primary
              }
            />
          </TouchableOpacity>

          {/* GALLERY */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.galleryRow
            }
          >
            {gallery.map(
              (img, index) => (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.85}
                  style={[
                    styles.thumbWrap,

                    selectedImage ===
                      index &&
                      styles.activeThumb,
                  ]}
                  onPress={() =>
                    setSelectedImage(
                      index
                    )
                  }
                >
                  <Image
                    source={resolveImage(
                      img
                    )}
                    style={styles.thumb}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )
            )}
          </ScrollView>

        </View>

        {/* DETAILS */}
        <View style={styles.card}>

          <Text style={styles.title}>
            {product?.name}
          </Text>

          <Text style={styles.seller}>
            Seller :{" "}
            {product?.seller ||
              "Bliss Handmade Store"}
          </Text>

          <View style={styles.priceRow}>

            <Text style={styles.price}>
              {product?.price}
            </Text>

            <Text style={styles.rating}>
              ⭐ {product?.rating}
            </Text>

          </View>

          {/* CATEGORY */}
          <View style={styles.tagRow}>

            <View style={styles.tag}>
              <Text style={styles.tagText}>
                {product?.category}
              </Text>
            </View>

            <View style={styles.tag}>
              <Text style={styles.tagText}>
                {product?.subcategory}
              </Text>
            </View>

          </View>

          {/* DESCRIPTION */}
          <Text style={styles.sectionTitle}>
            Description
          </Text>

          <Text style={styles.description}>
            {product?.description}
          </Text>

          {/* PRODUCT INFO */}
          <Text style={styles.sectionTitle}>
            Product Information
          </Text>

          <View style={styles.infoBox}>

            <InfoRow
              label="Material"
              value={
                product?.material ||
                "Premium Handmade"
              }
            />

            <InfoRow
              label="Delivery"
              value={
                product?.delivery ||
                "3 - 5 days"
              }
            />

            <InfoRow
              label="Return"
              value={
                product?.returnPolicy ||
                "7 days replacement"
              }
            />

            <InfoRow
              label="Stock"
              value={
                product?.stock ||
                "Available"
              }
            />

          </View>

          {/* BUTTONS */}
          <View style={styles.btnGap}>
            <Button
              title="Add To Cart"
              onPress={handleAddToCart}
            />
          </View>

          <Button
            title="Buy Now"
            color={COLORS.orange}
            onPress={handleBuyNow}
          />

        </View>

        <View style={{ height: 120 }} />

      </ScrollView>

    </View>
  );
}

function InfoRow({
  label,
  value,
}) {

  return (
    <View style={styles.infoRow}>

      <Text style={styles.infoLabel}>
        {label}
      </Text>

      <Text style={styles.infoValue}>
        {value}
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  imageSection: {
    backgroundColor: "#fff",
    paddingBottom: 10,
  },

  mainImage: {
    width: width,
    height: 360,
    backgroundColor: "#FFF7FA",
  },

  heartBtn: {
    position: "absolute",
    top: 18,
    right: 18,

    width: 46,
    height: 46,
    borderRadius: 23,

    backgroundColor: "#fff",

    alignItems: "center",
    justifyContent: "center",

    elevation: 4,
  },

  galleryRow: {
    paddingHorizontal: 14,
    paddingTop: 14,
  },

  thumbWrap: {
    width: 72,
    height: 72,
    borderRadius: 16,

    overflow: "hidden",

    marginRight: 10,

    borderWidth: 2,
    borderColor: "transparent",
  },

  activeThumb: {
    borderColor: COLORS.primary,
  },

  thumb: {
    width: "100%",
    height: "100%",
  },

  card: {
    margin: 16,
    backgroundColor: "#fff",

    borderRadius: 24,

    padding: 18,

    elevation: 4,
  },

  title: {
    fontSize: 25,
    fontWeight: "900",
    color: "#111827",
  },

  seller: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "700",
    color: "#6B7280",
  },

  priceRow: {
    marginTop: 14,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  price: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.primary,
  },

  rating: {
    fontSize: 15,
    fontWeight: "800",
    color: "#F59E0B",
  },

  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 16,
  },

  tag: {
    backgroundColor: "#EEF2FF",

    paddingHorizontal: 14,
    paddingVertical: 8,

    borderRadius: 20,

    marginRight: 10,
    marginBottom: 10,
  },

  tagText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "800",
  },

  sectionTitle: {
    marginTop: 22,
    marginBottom: 10,

    fontSize: 18,
    fontWeight: "900",

    color: "#111827",
  },

  description: {
    fontSize: 14,
    lineHeight: 24,
    color: "#6B7280",
    fontWeight: "600",
  },

  infoBox: {
    borderWidth: 1,
    borderColor: "#E5E7EB",

    borderRadius: 18,

    overflow: "hidden",
  },

  infoRow: {
    flexDirection: "row",

    justifyContent: "space-between",

    paddingHorizontal: 14,
    paddingVertical: 14,

    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  infoLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
  },

  infoValue: {
    flex: 1,

    textAlign: "right",

    fontSize: 13,
    fontWeight: "700",

    color: "#6B7280",
  },

  btnGap: {
    marginTop: 24,
    marginBottom: 12,
  },

});