import React, { useEffect } from "react";
import {
  Modal,
  Card,
  Text,
  Button,
  Layout,
  Input,
  Autocomplete,
  AutocompleteItem,
  Icon,
  List,
  Divider,
  ListItem,
  IndexPath,
  Select,
  SelectItem,
  Datepicker,
} from "@ui-kitten/components";
import { MomentDateService } from "@ui-kitten/moment";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Linking,
  Platform,
  ScrollView,
  Alert,
  Keyboard,
  Dimensions,
  Image,
} from "react-native";
import moment from "moment";
import Ionicons from "react-native-vector-icons/Ionicons";
import Feather from "react-native-vector-icons/Feather";
import Axios from "axios";
import { ApiConfig } from "../config/ApiConfig";
import { Root, Popup } from "popup-ui";

export const CreateStudentModal = ({ navigation, route }) => {
  const data = ["Male", "Female", "Non-binary", "Prefer not to say"];
  const relations = [
    "Parent",
    "Legal guardian",
    "Foster parent",
    "Grandparent",
    "Sibling/Other relative",
  ];
  const grade = [
    "Kindergarten",
    "First",
    "Second",
    "Third",
    "Fourth",
    "Fifth",
    "Sixth",
    "Seventh",
    "Eighth",
  ];
  const gradeApi = [
    "K",
    "1st",
    "2nd",
    "3rd",
    "4th",
    "5th",
    "6th",
    "7th",
    "8th",
  ];
  const [visibleModal, setVisibleModal] = React.useState(true);
  const [keyboardSize, setKeyboardSize] = React.useState(0);
  const [parentName, setParenName] = React.useState();
  const [parentLastName, setParentLastName] = React.useState();
  const { teamSeasonId, region, enrolled } = route.params;
  const [nameValue, setNameValue] = React.useState();
  const [middleNameValue, setMiddleNameValue] = React.useState();
  const [lastNameValue, setLastNameValue] = React.useState();
  const [allergies, setAllergies] = React.useState();
  const [selectedIndex, setSelectedIndex] = React.useState();
  const [displayedValue, setDisplayedValue] = React.useState(data[0]);
  const [parentEmail, setParentEmail] = React.useState();
  const [selectedIndexRelation, setSelectedIndexRelation] = React.useState();
  const [displayedValueRelation, setDisplayedValueRelation] = React.useState(
    relations[0]
  );
  const [selectedIndexGrade, setSelectedIndexGrade] = React.useState();
  const [displayedValueGrade, setDisplayedValueGrade] = React.useState(
    grade[0]
  );
  const [loadingModalstate, setLoadingModalstate] = React.useState(false);
  const [emergencyContactName, setEmergencyContactName] = React.useState();
  const [date, setDate] = React.useState(moment());

  useEffect(() => {
    console.log("test");
    Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardSize(e.endCoordinates.height);
    });

    Keyboard.addListener("keyboardDidHide", (e) => {
      setKeyboardSize(e.endCoordinates.height);
    });

    return () => {
      Keyboard.removeAllListeners("keyboardDidShow");
      Keyboard.removeAllListeners("keyboardDidHide");
    };
  }, []);

  const selectIndex = (index) => {
    setSelectedIndex(index);
    setDisplayedValue(data[index.row]);
  };

  const selectIndexRelation = (index) => {
    setSelectedIndexRelation(index);
    setDisplayedValueRelation(relations[index.row]);
  };

  const selectIndexGrade = (index) => {
    setSelectedIndexGrade(index);
    setDisplayedValueGrade(grade[index.row]);
  };

  const LoadingGif = () => {
    if (region === "ASBA") {
      return require("../../assets/Scores_Logo.gif"); //Scores logo gif
    } else if (region === "IFC") {
      return require("../../assets/IFC_Logo_animated.gif"); //IFC logo gif
    } else if (region === "OGSC") {
      return require("../../assets/OGSC_logo_spinner.gif"); //Genesis logo gif
    }
  };

  const loadingModal = () => (
    <Modal
      style={styles.popOverContent}
      visible={loadingModalstate}
      backdropStyle={styles.backdrop}
    >
      <Image source={LoadingGif()} />
    </Modal>
  );

  function closeModal() {
    setVisibleModal(false);
    navigation.pop(2);
  }

  function createStudent() {
    setLoadingModalstate(true);
    var birthDateFormat = date.toISOString().slice(0, 10);
    const student = {
      name: nameValue,
      middleName: middleNameValue,
      lastName: lastNameValue,
      gender: displayedValue,
      grade: gradeApi[selectedIndexGrade],
      birthdate: birthDateFormat,
      homePhone: studentHomePhone.value,
      allergies: allergies,
      parent: {
        name: parentName,
        lastName: parentLastName,
        phone: parentPhone.value,
        email: parentEmail,
      },
      emergencyContact: {
        name: emergencyContactName,
        phone: emergencyContactPhone.value,
        relationship: displayedValueRelation,
      },
    };
    if (student.name === undefined || student.lastName === undefined) {
      setLoadingModalstate(false);
      Popup.show({
        type: "Warning",
        title: "Warning!",
        button: true,
        textBody: "Complete required fields!",
        buttonText: "Ok",
        callback: () => Popup.hide(),
      });
    } else {
      createStudentEndpoint(student);
    }
  }

  async function createStudentEndpoint(student) {
    let studentObject = {
      FirstName: student.name,
      MiddleName: student.middleName,
      LastName: student.lastName,
      ContactType: "SCORES Student",
      Gender: student.gender,
      Birthdate: student.birthdate,
      HomePhone: student.homePhone,
      Allergies: student.allergies,
      Grade: student.grade,
      ParentFName: student.parent.name,
      ParentLName: student.parent.lastName,
      ParentPhone1: student.parent.phone,
      ParentEmail: student.parent.email,
      Emergency_Contact_Name: student.emergencyContact.name,
      Emergency_Contact_Phone1: student.emergencyContact.phone,
      Emergency_Contact_Relationship: student.emergencyContact.relationship,
    };
    console.log(studentObject);
    await Axios.post(`${ApiConfig.dataApi}/contacts`, studentObject)
      .then((res) => {
        if (res.data) {
          setLoadingModalstate(false);
          Popup.show({
            type: "Success",
            title: "Student created!",
            button: true,
            textBody: "The student was created successfully.",
            buttonText: "Ok",
            callback: () => {
              Popup.hide(), closeModal();
            },
          });
        }
      })
      .catch((e) => {
        console.log(e),
          setLoadingModalstate(false),
          Popup.show({
            type: "Danger",
            title: "Error!",
            button: true,
            textBody: "Oops, something went wrong. Please try again later.",
            buttonText: "Ok",
            callback: () => Popup.hide(),
          });
      });
  }

  const Footer = (props) => (
    <Layout {...props} style={{ marginBottom: "15%" }}>
      <Button appearance="ghost" status="danger" onPress={() => closeModal()}>
        Cancel
      </Button>
      <Button onPress={() => createStudent()}>CREATE STUDENT</Button>
    </Layout>
  );

  const Header = (props) => (
    <Layout {...props}>
      <Text category="h6">Create Student</Text>
      <Text category="s1" appearance="hint">
        A student with the following attributes will be created.
      </Text>
    </Layout>
  );

  const useInputState = (initialValue = "") => {
    const [value, setValue] = React.useState(initialValue);
    return { value, onChangeText: setValue };
  };
  const studentHomePhone = useInputState("");
  const parentPhone = useInputState("");
  const emergencyContactPhone = useInputState("");
  const windowHeight = Dimensions.get("window").height;
  const CalendarIcon = (props) => <Icon {...props} name="calendar" />;
  const dateService = new MomentDateService();
  const searchBox = () => (
    <Datepicker
      placeholder="Pick Date"
      min={moment("01/01/1900", "MM/DD/YYYY")}
      max={moment("01/01/2060", "MM/DD/YYYY")}
      date={date}
      placement="bottom"
      style={{ marginTop: "2%", marginBottom: "2%" }}
      dateService={dateService}
      onSelect={(nextDate) => setDate(nextDate)}
      accessoryRight={CalendarIcon}
    />
  );
  return (
    <Modal
      visible={visibleModal}
      onBackdropPress={() => closeModal()}
      style={{
        width: "95%",
        height: windowHeight,
        marginBottom: keyboardSize,
        marginTop: "7%",
      }}
    >
      <Root>
        <ScrollView>
          <Card
            disabled={true}
            style={{ marginBottom: keyboardSize, marginTop: "6%" }}
            header={Header}
            footer={Footer}
          >
            {loadingModal()}
            <Text style={{ marginBottom: "4%", fontWeight: "bold" }}>
              Student
            </Text>
            <Text>First name(*)</Text>
            <Input
              style={{ marginTop: "2%", marginBottom: "2%" }}
              placeholder="Name"
              value={nameValue}
              onChangeText={(enteredValue) => setNameValue(enteredValue)}
            />
            <Text>Middle name</Text>
            <Input
              style={{ marginTop: "2%", marginBottom: "2%" }}
              placeholder="Name"
              value={middleNameValue}
              onChangeText={(enteredValue) => setMiddleNameValue(enteredValue)}
            />
            <Text>Last name(*)</Text>
            <Input
              style={{ marginTop: "2%", marginBottom: "2%" }}
              placeholder="Last Name"
              value={lastNameValue}
              onChangeText={(enteredLastNameValue) =>
                setLastNameValue(enteredLastNameValue)
              }
            />
            <Text>Gender(*)</Text>
            <Select
              style={{ marginTop: "2%", marginBottom: "2%" }}
              placeholder="Select an option"
              value={displayedValue}
              selectedIndex={selectedIndex}
              onSelect={(index) => selectIndex(index)}
            >
              <SelectItem title="Male" />
              <SelectItem title="Female" />
              <SelectItem title="Non-binary" />
              <SelectItem title="Prefer not to say" />
            </Select>
            <Text>Birthdate(*)</Text>
            {searchBox()}
            <Text>Grade level</Text>
            <Select
              style={{ marginTop: "2%", marginBottom: "2%" }}
              placeholder="Select an option"
              value={displayedValueGrade}
              selectedIndex={selectedIndexGrade}
              onSelect={(index) => selectIndexGrade(index)}
            >
              <SelectItem title="Kindergarten" />
              <SelectItem title="First" />
              <SelectItem title="Second" />
              <SelectItem title="Third" />
              <SelectItem title="Fourth" />
              <SelectItem title="Fifth" />
              <SelectItem title="Sixth" />
              <SelectItem title="Seventh" />
              <SelectItem title="Eighth" />
            </Select>
            <Text>Allergies</Text>
            <Input
              style={{ marginTop: "2%", marginBottom: "2%" }}
              placeholder="Allergies"
              value={allergies}
              onChangeText={(enteredAllergiesValue) =>
                setAllergies(enteredAllergiesValue)
              }
            />
            <Text>Home phone</Text>
            <Input
              style={{ marginTop: "2%", marginBottom: "2%" }}
              keyboardType="numeric"
              placeholder="646 660 0404" //America scores phone
              {...studentHomePhone}
            />
            <Divider
              style={{
                backgroundColor: "black",
                marginTop: "5%",
                marginBottom: "5%",
              }}
            />
            <Text style={{ marginBottom: "4%", fontWeight: "bold" }}>
              Emergency Contact
            </Text>
            <Text>Name</Text>
            <Input
              style={{ marginTop: "2%", marginBottom: "2%" }}
              placeholder="Name"
              value={emergencyContactName}
              onChangeText={(enteredValue) =>
                setEmergencyContactName(enteredValue)
              }
            />
            <Text>Relationship</Text>
            <Select
              style={{ marginTop: "2%", marginBottom: "2%" }}
              placeholder="Select an option"
              value={displayedValueRelation}
              selectedIndex={selectedIndexRelation}
              onSelect={(index) => selectIndexRelation(index)}
            >
              <SelectItem title="Parent" />
              <SelectItem title="Legal Guardian" />
              <SelectItem title="Foster Parent" />
              <SelectItem title="Grandparent" />
              <SelectItem title="Sibling/Other Relative" />
            </Select>
            <Text>Phone</Text>
            <Input
              style={{ marginTop: "2%", marginBottom: "2%" }}
              keyboardType="numeric"
              placeholder="646 660 0404" //America scores phone
              {...emergencyContactPhone}
            />
            <Divider
              style={{
                backgroundColor: "black",
                marginTop: "5%",
                marginBottom: "5%",
              }}
            />
            <Text style={{ marginBottom: "4%", fontWeight: "bold" }}>
              Parent
            </Text>
            <Text>First name</Text>
            <Input
              style={{ marginTop: "2%", marginBottom: "2%" }}
              placeholder="Name"
              value={parentName}
              onChangeText={(enteredValue) => setParenName(enteredValue)}
            />
            <Text>Last name</Text>
            <Input
              style={{ marginTop: "2%", marginBottom: "2%" }}
              placeholder="Last Name"
              value={parentLastName}
              onChangeText={(enteredLastNameValue) =>
                setParentLastName(enteredLastNameValue)
              }
            />
            <Text>Phone</Text>
            <Input
              style={{ marginTop: "2%", marginBottom: "2%" }}
              keyboardType="numeric"
              placeholder="646 660 0404" //America scores phone
              {...parentPhone}
            />
            <Text>Email</Text>
            <Input
              style={{ marginTop: "2%", marginBottom: "2%" }}
              placeholder="Email"
              value={parentEmail}
              onChangeText={(parentemailValue) =>
                setParentEmail(parentemailValue)
              }
            />
          </Card>
        </ScrollView>
      </Root>
    </Modal>
  );
};

// const filter = async (item, value) => await item.Name.toLowerCase().includes(value.toLowerCase());

export const AddStudentToTeamModal = ({ navigation, route }) => {
  const [keyboardSize, setKeyboardSize] = React.useState(0);
  const [students, setStudents] = React.useState([]);
  const [finished, setFinished] = React.useState(false);
  const [started, setStarted] = React.useState(false);
  const { teamSeasonId, region, enrolled } = route.params;
  const [visible, setVisible] = React.useState(true);
  const [selectedStudent, setSelectedStudent] = React.useState();
  const [suggestions, setSuggestions] = React.useState();
  const [loadingModalstate, setLoadingModalstate] = React.useState(false);
  useEffect(() => {
    setVisible(true);
    Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardSize(e.endCoordinates.height);
    });

    Keyboard.addListener("keyboardDidHide", (e) => {
      setKeyboardSize(e.endCoordinates.height);
    });

    return () => {
      Keyboard.removeAllListeners("keyboardDidShow");
      Keyboard.removeAllListeners("keyboardDidHide");
    };
  }, []);

  const renderSearchIcon = (props) => (
    // <TouchableOpacity onPress={() => filterData()}>
    <Icon {...props} name="search-outline" />
    // </TouchableOpacity>
  );

  function closeModal() {
    setVisible(false);
    navigation.goBack();
  }

  function createStudentModal() {
    setVisible(false);
    navigation.navigate("CreateStudentModal", {
      teamSeasonId: teamSeasonId,
      region: region,
      enrolled: enrolled,
    });
  }

  function openWhatsappGroup() {
    let phoneWithCountryCode = [];
    phoneWithCountryCode.map((value) => {
      let url = `http://api.whatsapp.com/send?text=hello&phone=${value}`;
      Linking.openURL(url)
        .then((data) => {
          console.log("WhatsApp Opened");
        })
        .catch(() => {
          alert("Make sure WhatsApp installed on your device");
        });
    });
  }
  const LoadingGif = () => {
    if (region === "ASBA") {
      return require("../../assets/Scores_Logo.gif"); //Scores logo gif
    } else if (region === "IFC") {
      return require("../../assets/IFC_Logo_animated.gif"); //IFC logo gif
    } else if (region === "OGSC") {
      return require("../../assets/OGSC_logo_spinner.gif"); //Genesis logo gif
    }
  };

  async function canCreateStudent() {
    if (selectedStudent) {
      setLoadingModalstate(true);
      const exists = enrolled.find(
        (student) => student.StudentId === selectedStudent.Id
      );

      if (!exists) {
        createStudent();
      } else {
        setLoadingModalstate(false);
        Alert.alert("Error", "This student is already enrolled in this team");
      }
    } else {
      Alert.alert("Error", "You have to select a student first");
    }
  }

  async function createStudent() {
    let student = {
      TeamSeasonId: teamSeasonId,
      StudentId: selectedStudent.Id,
    };
    await Axios.post(`${ApiConfig.dataApi}/enrollments`, student)
      .then((res) => {
        if (res.data) {
          setLoadingModalstate(false);
          Alert.alert("Success", "Student was enrolled succesfully");
          setValue("");
          setData([]);
        }
        setLoadingModalstate(false);
      })
      .catch((e) => console.log(e));
  }

  const [value, setValue] = React.useState("");
  const [data, setData] = React.useState([]);

  const onSelect = (index) => {
    setValue(data[index].Name);
    setSelectedStudent(data[index]);
  };

  const loadingModal = () => (
    <Modal
      style={styles.popOverContent}
      visible={loadingModalstate}
      backdropStyle={styles.backdrop}
    >
      <Image source={LoadingGif()} />
    </Modal>
  );

  async function fetchStudents(query) {
    /*delete Axios.defaults.headers.common['client_id'];
        delete Axios.defaults.headers.common['client_secret'];
        Axios.defaults.headers.common['client_id'] = ApiConfig.clientIdSandbox;
        Axios.defaults.headers.common['client_secret'] = ApiConfig.clientSecretSandbox;  */
    return await Axios.get(`${ApiConfig.dataApi}/contacts/search`, {
      params: {
        // Hardcoded value, change the "2019-08-21" for this.state.date for getting the result in a specific date
        searchString: query,
      },
    })
      .then((res) => res.data)
      .catch((e) => console.log(e));
  }

  // async function startTimer() {
  //     setTimeout(filterData, 3000);
  //     // console.log()
  // };

  async function filterData() {
    const unfiltered = await fetchStudents(value);
    console.log(unfiltered);
    if (unfiltered.length > 0) {
      setData(unfiltered);
    } else {
      Alert.alert("", "No students found");
    }
  }

  const renderOption = ({ item, index }) => (
    <ListItem
      title={item.FirstName + " " + item.MiddleName + " " + item.LastName}
      onPress={() => onSelect(index)}
    />
  );

  const Footer = (props) => (
    <Layout {...props}>
      <Button appearance="ghost" status="danger" onPress={() => closeModal()}>
        Cancel
      </Button>
      <Button onPress={() => canCreateStudent()}>ADD STUDENT</Button>
      {/*<Ionicons
                    name="logo-whatsapp"
                    size={28}
                    style={{color: 'green', marginTop:'4.7%',justifyContent:'space-between', marginLeft:'38.9%'}}
                    onPress={() => openWhatsappGroup()}
            />*/}
    </Layout>
  );

  const Header = (props) => (
    <Layout {...props}>
      <Text category="h6">Add a Student to a team</Text>
      <Text category="s1" appearance="hint">
        Search for a student and add it to a team.
      </Text>
      <View style={styles.missingStudentContainer}>
        <Text category="s1" appearance="hint" style={styles.missingStudentText}>
          Haven't found a student?
        </Text>
        <Button appearance="ghost" onPress={() => createStudentModal()}>
          Create student
        </Button>
      </View>
    </Layout>
  );

  const SearchBar = () => (
    <View>
      <Input
        placeholder="Student Name"
        value={value}
        onChangeText={(enteredSureNameValue) => setValue(enteredSureNameValue)}
      />
    </View>
  );

  return (
    <React.Fragment>
      <Modal
        visible={visible}
        onBackdropPress={() => closeModal()}
        style={{ width: "95%", height: "100%", marginTop: "17%" }}
      >
        <ScrollView>
          <Card
            disabled={true}
            style={{
              height: "100%",
              width: "100%",
              marginBottom: keyboardSize,
            }}
            header={Header}
            footer={Footer}
          >
            <ScrollView>
              {SearchBar()}
              <Button
                style={{ margin: 2 }}
                appearance="outline"
                accessoryRight={renderSearchIcon}
                onPress={() => filterData()}
              >
                Search
              </Button>
              {loadingModal()}
              {/* <View> */}
              <List
                style={{ opacity: 0.95, overflow: "scroll", maxHeight: 180 }}
                data={data}
                ItemSeparatorComponent={Divider}
                renderItem={renderOption}
              />
              {/* </View> */}
            </ScrollView>
          </Card>
        </ScrollView>
      </Modal>
    </React.Fragment>
  );
};

export const StudentInfoModal = ({ navigation, route }) => {
  const [visible, setVisible] = React.useState(true);
  const {
    StudentName,
    Birthdate,
    Allergies,
    ParentName,
    ParentPhone,
    EmergencyContactName,
    EmergencyContactRelationToChild,
    EmergencyContactPhone,
    SecondEmergencyContactName,
    SecondEmergencyContactRelationToChild,
    SecondEmergencyContactPhone,
    LastModifiedDate,
  } = route.params;

  function closeModal() {
    setVisible(false);
    navigation.goBack();
  }

  function openWhatsapp(phone) {
    let phoneWithCountryCode = "+" + 1 + phone;
    let url = `http://api.whatsapp.com/send?phone=${phoneWithCountryCode}`;
    Linking.openURL(url)
      .then((data) => {
        console.log("WhatsApp Opened");
      })
      .catch(() => {
        alert("Make sure WhatsApp installed on your device");
      });
  }
  function openNumber(phone) {
    let phoneNumber = "";
    if (Platform.OS === "android") {
      phoneNumber = `tel:${phone}`;
    } else {
      phoneNumber = `telprompt:${phone}`;
    }
    Linking.openURL(phoneNumber);
  }
  function smsNumber(phone) {
    let phoneNumber = "";
    if (Platform.OS === "android") {
      phoneNumber = `sms:${phone}`;
    } else {
      phoneNumber = `sms:${phone}`;
    }
    Linking.openURL(phoneNumber);
  }
  const Footer = (props) => (
    <Layout {...props}>
      <Button onPress={() => closeModal()}>CLOSE</Button>
    </Layout>
  );

  const Header = (props) => (
    <Layout {...props}>
      <Text category="h6">{StudentName}</Text>
      <Text category="s1">Date of Birth: {Birthdate}</Text>
      <Text category="s1" appearance="hint">
        Last Modified Date:{" "}
        {moment(LastModifiedDate).format("MMMM Do YYYY, h:mm:ss a")}
      </Text>
    </Layout>
  );

  return (
    <Modal
      visible={visible}
      onBackdropPress={() => closeModal()}
      style={{ width: "100%" }}
    >
      <Card
        disabled={true}
        header={Header}
        footer={Footer}
        style={{ width: "102%" }}
      >
        <ScrollView>
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>
            Allergies/Medical Conditions:
          </Text>
          <Text> {Allergies}</Text>
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>
            {"\n"}Parent Info:
          </Text>
          <Text> {ParentName}</Text>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              onPress={() => openNumber(ParentPhone)}
              style={{ width: "45%", marginTop: "1%" }}
            >
              <Text
                style={{ color: "#add8e6", textDecorationLine: "underline" }}
              >
                +1{ParentPhone}
              </Text>
            </TouchableOpacity>
            {ParentPhone.length !== 0 ? (
              <React.Fragment>
                <Ionicons
                  name="logo-whatsapp"
                  size={28}
                  style={{ color: "green", justifyContent: "space-between" }}
                  onPress={() => openWhatsapp(ParentPhone)}
                />
                <Feather
                  name="phone-call"
                  size={25}
                  style={{
                    color: "black",
                    justifyContent: "space-between",
                    marginLeft: "7%",
                  }}
                  onPress={() => openNumber(ParentPhone)}
                />
                <Feather
                  name="message-square"
                  size={25}
                  style={{
                    color: "black",
                    justifyContent: "space-between",
                    marginLeft: "7%",
                  }}
                  onPress={() => smsNumber(ParentPhone)}
                />
              </React.Fragment>
            ) : (
              <></>
            )}
          </View>
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>
            {"\n"}Emergency Contact:
          </Text>
          <Text> {EmergencyContactName}</Text>
          <Text style={{ fontWeight: "bold" }}> Relationship:</Text>
          <Text> {EmergencyContactRelationToChild}</Text>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              onPress={() => openNumber(EmergencyContactPhone)}
              style={{ width: "45%", marginTop: "1%" }}
            >
              <Text
                style={{ color: "#add8e6", textDecorationLine: "underline" }}
              >
                +1{EmergencyContactPhone}
              </Text>
            </TouchableOpacity>
            {EmergencyContactPhone.length !== 0 ? (
              <React.Fragment>
                <Ionicons
                  name="logo-whatsapp"
                  size={28}
                  style={{ color: "green", justifyContent: "space-between" }}
                  onPress={() => openWhatsapp(EmergencyContactPhone)}
                />
                <Feather
                  name="phone-call"
                  size={25}
                  style={{
                    color: "black",
                    justifyContent: "space-between",
                    marginLeft: "7%",
                  }}
                  onPress={() => openNumber(EmergencyContactPhone)}
                />
                <Feather
                  name="message-square"
                  size={25}
                  style={{
                    color: "black",
                    justifyContent: "space-between",
                    marginLeft: "7%",
                  }}
                  onPress={() => smsNumber(EmergencyContactPhone)}
                />
              </React.Fragment>
            ) : (
              <></>
            )}
          </View>
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>
            {"\n"}Second Emergency Contact:
          </Text>
          <Text> {SecondEmergencyContactName}</Text>
          <Text style={{ fontWeight: "bold" }}> Relationship:</Text>
          <Text> {SecondEmergencyContactRelationToChild}</Text>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              onPress={() => openNumber(SecondEmergencyContactPhone)}
              style={{ width: "45%", marginTop: "1%" }}
            >
              <Text
                style={{ color: "#add8e6", textDecorationLine: "underline" }}
              >
                +1{SecondEmergencyContactPhone}
              </Text>
            </TouchableOpacity>
            {SecondEmergencyContactPhone.length !== 0 ? (
              <React.Fragment>
                <Ionicons
                  name="logo-whatsapp"
                  size={28}
                  style={{ color: "green", justifyContent: "space-between" }}
                  onPress={() => openWhatsapp(SecondEmergencyContactPhone)}
                />
                <Feather
                  name="phone-call"
                  size={25}
                  style={{
                    color: "black",
                    justifyContent: "space-between",
                    marginLeft: "7%",
                  }}
                  onPress={() => openNumber(SecondEmergencyContactPhone)}
                />
                <Feather
                  name="message-square"
                  size={25}
                  style={{
                    color: "black",
                    justifyContent: "space-between",
                    marginLeft: "7%",
                  }}
                  onPress={() => smsNumber(SecondEmergencyContactPhone)}
                />
              </React.Fragment>
            ) : (
              <></>
            )}
          </View>
        </ScrollView>
      </Card>
    </Modal>
  );
};

const styles = StyleSheet.create({
  popOverContent: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    shadowRadius: 10,
    shadowOpacity: 0.12,
    shadowColor: "#000",
  },
  image: {
    flex: 1,
    resizeMode: "contain",
    opacity: 0.99,
  },
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  missingStudentContainer: {
    flexDirection: "row",
  },
  missingStudentText: {
    marginTop: "3.5%",
  },
});
