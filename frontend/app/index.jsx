import { Ionicons } from "@expo/vector-icons";
import { Image, ImageBackground, StyleSheet, Text, View } from "react-native";
import heroImage from "../assets/images/headerImage.png";
import logoMatelior from "../assets/images/matelior.png";
const category = [
  {
    title: "PENDANTS",
    icon: require("../assets/images/category/pendant.png"),
  },
  {
    title: "BRACELETS",
    icon: require("../assets/images/category/bracelet.png"),
  },
  {
    title: "RINGS",
    icon: require("../assets/images/category/ring.png"),
  },
  {
    title: "BELTS",
    icon: require("../assets/images/category/belt.png"),
  },
  {
    title: "WALLETS",
    icon: require("../assets/images/category/wallet.png"),
  },
];
export default function Homepage() {
  return (
    <View style={styles.main}>
      {/* header */}
      <View style={styles.header}>
        <Ionicons name="menu-outline" color="white" size={32} />
        <Image source={logoMatelior} style={styles.logo} />
        <View style={styles.headerRight}>
          <Ionicons name="search-outline" size={28} color="white" />
          <View style={styles.cart}>
            <Ionicons name="bag-outline" size={28} color="white" />
            <View style={styles.cartNumber}>
              <Text style={styles.cartNumberText}>0</Text>
            </View>
          </View>
        </View>
      </View>
      {/* hero section */}
      <ImageBackground source={heroImage} style={styles.hero}>
        {/* heroSection/textAndButton on left */}
        <View style={styles.textButtonCont}>
          <Text style={styles.heroText1}>
            ACCESSORIES FOR{"\n"}THE PERSON WITH TASTE
          </Text>
          <Text style={styles.heroText2}>
            TIMELESS.{"\n"}
            MINIMAL.{"\n"}
            MATELIOR.
          </Text>
          <Text style={styles.heroText3}>
            Premium Accessories{"\n"}
            Crafted for You.{"\n"}
          </Text>
          <View style={styles.heroButton}>
            <Text style={{ fontSize: 10 }}>SHOP NOW</Text>
            <Ionicons name="arrow-forward-outline" size={16} />
          </View>
        </View>
        {/* heroDots */}
        <View style={styles.dotContainer}>
          <View style={{ ...styles.dot, backgroundColor: "white" }}></View>
          <View style={styles.dot}></View>
          <View style={styles.dot}></View>
        </View>
      </ImageBackground>
      {/* categorySection */}
      <View style={styles.categoryCont}>
        {category.map((item, i) => {
          return (
            <View style={styles.categoryBox} key={i}>
              <View style={styles.categoryCircle}>
                <Image source={item.icon} style={styles.categoryIcon} />
              </View>
              <Text style={styles.categoryText}>{item.title}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  main: {
    height: "100%",
    backgroundColor: "black",
    paddingHorizontal: 10,
  },
  logo: {
    height: 30,
    width: 180,
    position: "absolute",
    left: 95,
    top: 6,
  },
  headerRight: {
    flexDirection: "row",
    gap: 15,
  },
  cartNumber: {
    position: "absolute",
    height: 18,
    width: 18,
    backgroundColor: "white",
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    right: -5,
    top: -5,
  },
  cartNumberText: {
    fontSize: 10,
  },
  hero: {
    height: 280,
    marginTop: 20,
  },
  textButtonCont: {
    marginLeft: 10,
  },
  heroText1: {
    color: "gray",
    fontSize: 10,
    marginTop: 25,
  },
  heroText2: {
    color: "white",
    fontSize: 24,
    marginTop: 15,
  },
  heroText3: {
    color: "gray",
    fontSize: 10,
    marginTop: 10,
  },
  heroButton: {
    backgroundColor: "white",
    width: 108,
    height: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    padding: 5,
    justifyContent: "center",
    borderRadius: 2,
    marginTop: 5,
  },
  dotContainer: {
    flexDirection: "row",
    gap: 15,
    marginTop: 20,
    marginHorizontal: "auto",
  },
  dot: {
    height: 9,
    width: 9,
    borderRadius: 4.5,
    borderWidth: 1,
    borderColor: "white",
  },
  categoryCont: {
    flexDirection: "row",
    marginTop: 15,
  },
  categoryBox: {
    marginRight: 10,
    alignItems: "center",
    gap: 5,
  },
  categoryCircle: {
    height: 70,
    width: 70,
    borderRadius: 35,
    backgroundColor: "#181818",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryText: {
    color: "white",
    fontSize: 10,
  },
  categoryIcon: {
    height: 80,
    width: 80,
  },
});
