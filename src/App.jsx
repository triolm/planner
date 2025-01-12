import React, { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import Badge from 'react-bootstrap/Badge';
import Card from 'react-bootstrap/Card';
import { useDrop } from 'react-dnd';
import { useDrag } from 'react-dnd';
import { TrashFill, X, XLg, GripVertical } from 'react-bootstrap-icons';
import { Tooltip } from 'react-tooltip'
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import './App.css'


import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { CardBody } from 'react-bootstrap';

const getCourses = () => JSON.parse(localStorage.getItem('courses')) || []
const getNextId = () => Number(localStorage.getItem('nextId')) || 0
// const getCourses = () =>  []

function App() {
  const [courses, setCourses] = useState(getCourses())
  const [nextId, setNextId] = useState(getNextId())
  const [groupByDept, setGroupByDept] = useState(true)
  const [addingCourse, setAddingCourse] = useState(false)
  const [editingSemesters, setEditingSemesters] = useState(false)
  const [semesters, setSemesters] = useState(["Fall 2024", "Spring 2025", "Fall 2025", "Spring 2026", "Fall 2026", "Spring 2027", "Fall 2027", "Spring 2028"])
  useEffect(() => {
    localStorage.setItem('courses', JSON.stringify(courses))
  }, [courses])

  let addCourse = (code, name, dept, tags, credits) => { setCourses([...courses, { id: nextId, code, name, dept, tags, semester: null, credits }]); setNextId(nextId + 1); localStorage.setItem('nextId', nextId + 1) }

  const updateCourseSemester = (id, semester) => {
    setCourses((prevCourses) =>
      prevCourses.map((course) =>
        course.id === id ? { ...course, semester: semester } : course
      )
    );
  };
  const removeCourse = (id) => {
    setCourses((prevCourses) => prevCourses.filter((course) => course.id != id));
  };
  const removeFromSemester = (id) => {
    setCourses((prevCourses) =>
      prevCourses.map((course) =>
        course.id === id ? { ...course, semester: null } : course
      )
    );
  };
  return (
    <div className='d-flex flex-column' style={{ height: "100vh" }} >
      <Navigation />
      {/* {JSON.stringify(courses)} */}
      <div className='col-md-8 offset-md-2 m-3 mx-md-auto'>

        {addingCourse && <CourseForm addCourse={addCourse} setAddingCourse={setAddingCourse} />}
        {editingSemesters && <EditSemesters semesters={semesters} setSemesters={setSemesters} setEditingSemesters={setEditingSemesters} />}

      </div>
      {/* <Button onClick={() => setAddingCourse(true)}>Add Course</Button> */}
      {/* <Button onClick={() => setEditingSemesters(true)}>Edit Semesters</Button> */}
      <div style={{ flexGrow: 1, overflow: "hidden" }} >

        <div className='d-flex flex-row' style={{ height: "100%" }}>

          <DndProvider backend={HTML5Backend}>
            <div className="col-5 m-0 ps-3" style={{ height: "100%", overflow: "scroll" }}>
              <div className='d-flex flex-row justify-content-between my-3 me-2'>
                <span>
                  <Button variant="info" className='me-2' onClick={() => setAddingCourse(true)}>Add Course</Button>
                  <Button variant="info" onClick={() => setEditingSemesters(true)}>Edit Semesters</Button>
                </span>
                <div>

                  <ButtonGroup className='ms-0'>
                    <input type="radio" className="btn-check" name="options" id="option1" defaultChecked onClick={(e) => setGroupByDept(true)} />
                    <label className="btn btn-outline-primary" htmlFor="option1">Department</label>

                    <input type="radio" className="btn-check" name="options" id="option2" onClick={(e) => setGroupByDept(false)} />
                    <label className="btn btn-outline-primary" htmlFor="option2">Tags</label>
                  </ButtonGroup>
                </div>
              </div>

              {groupByDept && <CoursesByDepartment courses={courses} removeFromSemester={removeFromSemester} removeCourse={removeCourse} />}
              {!groupByDept && <CoursesByTags courses={courses} removeFromSemester={removeFromSemester} removeCourse={removeCourse} />}
            </div>
            <div className='col-7' style={{ height: "100%", overflow: "scroll" }}>
              {semesters.map((semester, i) =>
                <Semester key={i} courses={courses} semester={semester} updateCourseSemester={updateCourseSemester} removeFromSemester={removeFromSemester} removeCourse={removeCourse} />
              )}
            </div>
          </DndProvider>
          <Tooltip id="remove" />

        </div>
      </div>
    </div>
  )
}


function Navigation() {
  return (
    <Navbar bg="primary" data-bs-theme="dark">
      <Container>
        <Navbar.Brand href="#home">Calvin</Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link href="#home">Link</Nav.Link>
          <Nav.Link href="#features">Somewhere</Nav.Link>
        </Nav>
      </Container>
    </Navbar>)
}

function Course({ id, code, name, dept, tags, semester, inSemester, credits, removeFromSemester, removeCourse }) {
  const [{ isDragging }, dragRef] = useDrag({
    type: 'course',
    item: { id, code, name, dept, tags, credits },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  })


  return (
    <div className='d-flex flex-row course align-items-center' style={{ marginLeft: "-10px" }} ref={dragRef}>
      <GripVertical />
      <p className='my-0'> <strong style={{ whiteSpace: "nowrap" }}>{code}</strong> {name}</p>
      <span className='d-flex flex-row align-items-center'>
        {inSemester && <Badge className='mx-1' bg="primary">{dept}</Badge>}
        {tags.map((tag) =>
          <Badge className='mx-1' bg="secondary">{tag}</Badge>
        )}
        {!inSemester && <Badge className='mx-1' bg="warning">{semester}</Badge>}
      </span>
      <span>
        {inSemester && <button onClick={() => removeFromSemester(id)} style={{ border: "None", background: "None", margin: "0", padding: "0" }}>
          <Badge pill className='mx-1 garbage' bg="danger"
            data-tooltip-id="remove" data-tooltip-content="Remove from Semester"
          ><X /></Badge>
        </button>}
        {!inSemester && <button onClick={() => removeCourse(id)} style={{ border: "None", background: "None", margin: "0", padding: "0" }}>
          <Badge className='mx-1 garbage' bg="danger"
            data-tooltip-id="remove" data-tooltip-content="Delete Class"
          ><TrashFill /></Badge>
        </button>}
      </span>
    </div>
  )
}

const FilteredCourses = ({ groupedCourses, removeFromSemester, removeCourse }) => {
  const sortedDepartments = Object.keys(groupedCourses).sort();

  // Render
  return sortedDepartments.map((dept) => (
    <div key={dept} className='mt-4'>
      <strong className='text-primary'>{dept} ({groupedCourses[dept].credits} credits) </strong>
      {groupedCourses[dept].courses.map((course, i) => (
        <Course
          key={i}
          id={course.id}
          code={course.code}
          name={course.name}
          dept={course.dept}
          tags={course.tags}
          credits={course.credits}
          semester={course.semester}
          inSemester={false}
          removeFromSemester={removeFromSemester} removeCourse={removeCourse}
        />
      ))}
    </div>
  ))
}

const CoursesByDepartment = ({ courses, removeFromSemester, removeCourse }) => {
  const groupedCourses = courses.reduce((acc, course) => {
    if (!acc[course.dept]) {
      acc[course.dept] = { credits: 0, courses: [] };
    }
    acc[course.dept].courses.push(course);
    acc[course.dept].credits += course.credits;
    return acc;
  }, {});
  return (
    <FilteredCourses groupedCourses={groupedCourses} removeFromSemester={removeFromSemester} removeCourse={removeCourse} />
  )

};
const CoursesByTags = ({ courses, removeFromSemester, removeCourse }) => {
  const groupedCourses = []

  for (let course of courses) {
    if (course.tags.length) {
      for (let tag of course.tags) {
        if (!groupedCourses[tag]) {
          groupedCourses[tag] = { credits: 0, courses: [] }
        }
        groupedCourses[tag].courses.push(course);
        groupedCourses[tag].credits += course.credits;
      }
    } else {
      if (!groupedCourses["Untagged"]) {
        groupedCourses["Untagged"] = { credits: 0, courses: [] }
      }
      groupedCourses["Untagged"].courses.push(course);
      groupedCourses["Untagged"].credits += course.credits;
    }
  }

  return (
    <FilteredCourses groupedCourses={groupedCourses} removeFromSemester={removeFromSemester} removeCourse={removeCourse} />
  )

};


function Semester({ semester, updateCourseSemester, courses, removeFromSemester, removeCourse }) {
  const [semesterCourses, setSemesterCourses] = useState([])
  const [credits, setCredits] = useState(0)
  const [{ isOver }, dropRef] = useDrop({
    accept: 'course',
    drop: (item) => updateCourseSemester(item.id, semester),
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  })
  useEffect(() => {
    const filteredCourses = courses.filter((course) => course.semester === semester);
    setSemesterCourses(filteredCourses);
    setCredits(filteredCourses.reduce((sum, course) => course.credits + sum, 0));
  }, [courses]);

  return (
    <>
      <Card className='my-2'>
        <Card.Body>
          <div className='w-100' ref={dropRef}>
            <strong className='text-primary'>
              {semester} ({credits} credits)

            </strong>
            {semesterCourses // Filter courses with name === 1
              .map((course, i) => (
                <Course key={i} id={course.id} code={course.code} name={course.name} dept={course.dept} tags={course.tags} credits={course.credits} semester={course.semester} inSemester={true} removeFromSemester={removeFromSemester} removeCourse={removeCourse} />
              ))}
            {(isOver || !semesterCourses.length) && <div className='text-center' style={{ border: "1.5px dashed gray", color: "gray", borderRadius: "7px", lineHeight: "2.5em" }}>Drag and Drop Course</div>}
          </div>
        </Card.Body>
      </Card>
    </>
  )
}


function CourseForm({ addCourse, setAddingCourse }) {
  const [course, setCourse] = useState("")
  const [code, setCode] = useState("")
  const [dept, setDept] = useState("")
  const [tags, setTags] = useState([])
  const [credits, setCredits] = useState("")
  const submitForm = (e) => {
    e.preventDefault()
    addCourse(code, course, dept, tags, credits)
  }
  const autofill = async (e) => {
    const info = await fetchClass(code.toUpperCase())
    if (!info.title) {
      return
    }
    setCourse(info.title)
    setCode(info.code)
    setDept(info.code.split(" ")[0])
    setCredits(parseInt(info.code.split("").pop()))
  }

  const handleKeyDown = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await autofill()
    }
  };

  return (
    <div style={{ position: 'absolute', width: "100vw", height: "100vh", zIndex: "1000", top: 0, left: 0, background: "#00000088", paddingTop: "150px" }}>
      <div className='col-md-8 offset-md-2'>

        <Card className='w-100 d-flex flex-column align-items-end p-3'>
          <button onClick={() => { setAddingCourse(false) }} style={{ margin: 0, padding: 0, border: "none", background: "none" }}>
            <Badge className='p-2' bg="danger" ><XLg /></Badge>
          </button>
          <CardBody className='col-12'>
            <h2>Add New Course</h2>
            <Form onSubmit={submitForm} onKeyDown={handleKeyDown}>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <InputGroup className="mb-3">
                  <InputGroup.Text id="inputGroup-sizing-default">Course Code</InputGroup.Text>
                  <Form.Control required value={code} onInput={(e) => setCode(e.target.value)} type="text" placeholder="XX-UY 1234" />
                </InputGroup>
                <InputGroup className="mb-3">
                  <InputGroup.Text id="inputGroup-sizing-default">Name</InputGroup.Text>
                  <Form.Control required value={course} onInput={(e) => setCourse(e.target.value)} type="text" placeholder="Course Name" />
                </InputGroup>
                <InputGroup className="mb-3">
                  <InputGroup.Text id="inputGroup-sizing-default">Department</InputGroup.Text>
                  <Form.Control required value={dept} onInput={(e) => setDept(e.target.value)} type="text" placeholder="XX-UY" />
                </InputGroup>
                <InputGroup className="mb-3">
                  <InputGroup.Text id="inputGroup-sizing-default">Credits</InputGroup.Text>
                  <Form.Control required value={credits} onInput={(e) => setCredits(parseInt(e.target.value))} type="number" placeholder="Course Credits" />
                </InputGroup>
                <InputGroup className="mb-3">
                  <InputGroup.Text id="inputGroup-sizing-default">Tags</InputGroup.Text>
                  <Form.Control onInput={(e) => setTags(e.target.value.split(/\s*,\s*/).filter(Boolean))} type="text" placeholder="Course Tags (Separated by Commas)" />
                </InputGroup>
              </Form.Group>
              <Button variant="primary" type="submit" className='me-2'>
                Submit
              </Button>
              <Button variant="light" onClick={autofill} type="button">
                Auto Fill from Course Code
              </Button>
            </Form>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

const EditSemesters = ({ semesters, setSemesters, setEditingSemesters }) => {
  const [semesterString, setSemesterString] = useState(semesters)
  return (
    <div style={{ position: 'absolute', width: "100vw", height: "100vh", zIndex: "1000", top: 0, left: 0, background: "#00000088", paddingTop: "150px" }}>
      <div className='col-md-8 offset-md-2'>

        <Card className='w-100 d-flex flex-column align-items-end p-3'>
          <button onClick={() => { setEditingSemesters(false) }} style={{ margin: 0, padding: 0, border: "none", background: "none" }}>
            <Badge className='p-2' bg="danger" ><XLg /></Badge>
          </button>
          <CardBody className='col-12'>
            <h2>Semesters (Comma Separated)</h2>
            <Form onSubmit={(e) => { e.preventDefault(); setSemesters(semesterString); setEditingSemesters(false) }}>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Control required value={semesterString} onInput={(e) => setSemesterString(e.target.value.split(/\s*,\s*/).filter(Boolean))} as="textarea" placeholder="Semesters (Separated By Commas)" />
              </Form.Group>
              <Button variant="primary" type="submit" className='me-2'>
                Submit
              </Button>
            </Form>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
const fetchClass = async (classname) => {
  console.log(classname)
  const url = "/class-search/api/?page=fose&route=details"; // Relative URL

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
    body: JSON.stringify({
      group: `code:${classname}`,
      srcdb: "1254",
    }),
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.statusText}`);
  }

  const data = await response.json();
  console.log(data);
  return data;
};

export default App
