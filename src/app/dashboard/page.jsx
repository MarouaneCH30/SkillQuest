'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Timer } from "lucide-react"

export default function DashboardPage() {
  const [weeklyProgress, setWeeklyProgress] = useState(60)
  const [skills, setSkills] = useState([])
  const [user, setUser] = useState(null)
  const [newSkillName, setNewSkillName] = useState("")
  const [subskillInputs, setSubskillInputs] = useState({})
  const [timerRunning, setTimerRunning] = useState(false)
  const [selectedSubskillId, setSelectedSubskillId] = useState("")
  const [startTime, setStartTime] = useState(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const timerRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/login")
    } else {
      const parsedUser = JSON.parse(storedUser)
      setUser(parsedUser)
      fetchSkills(parsedUser.id)
    }
  }, [router])

  const fetchSkills = async (userId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/skills/${userId}`);
      const data = await res.json();

      const skillsWithSubskills = await Promise.all(
        data.map(async (skill) => {
          const subRes = await fetch(`http://localhost:5000/api/skills/${skill.id}/subskills`);
          const subskills = await subRes.json();
          return { ...skill, subskills };
        })
      );

      setSkills(skillsWithSubskills);
    } catch (err) {
      console.error("Failed to fetch skills or subskills:", err);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkillName.trim()) return;

    try {
      const res = await fetch("http://localhost:5000/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, name: newSkillName }),
      });

      const data = await res.json();

      if (res.ok) {
        setNewSkillName("");
        fetchSkills(user.id);
      } else {
        alert(data.message || "Error adding skill");
      }
    } catch (err) {
      console.error("Add skill error:", err);
      alert("Failed to add skill");
    }
  };

  const handleAddSubskill = async (skillId) => {
    const name = subskillInputs[skillId];
    if (!name || !name.trim()) return;

    try {
      const res = await fetch(`http://localhost:5000/api/skills/${skillId}/subskills`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        setSubskillInputs({ ...subskillInputs, [skillId]: "" });
        fetchSkills(user.id);
      } else {
        alert("Failed to add subskill");
      }
    } catch (err) {
      console.error("Add subskill error:", err);
    }
  }

  const handleStart = () => {
    if (!selectedSubskillId) return alert("Please select a subskill")
    setStartTime(Date.now())
    setElapsedSeconds(0)
    setTimerRunning(true)

    timerRef.current = setInterval(() => {
      setElapsedSeconds(prev => prev + 1)
    }, 1000)
  }

  const handleStop = async () => {
    if (!startTime || !selectedSubskillId) return
    clearInterval(timerRef.current)
    const elapsedMinutes = Math.floor(elapsedSeconds / 60)
    const earnedXp = elapsedMinutes * 10

    try {
      await fetch(`http://localhost:5000/api/skills/subskills/${selectedSubskillId}/xp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ xp: earnedXp }),
      });
      fetchSkills(user.id)
    } catch (err) {
      console.error("Error updating XP:", err)
    }

    setTimerRunning(false)
    setStartTime(null)
    setElapsedSeconds(0)
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user.name}</h1>
          <p className="text-muted-foreground">You've earned 1200 XP total</p>
        </div>
        <div className="w-64">
          <p className="text-sm mb-1">Weekly Goal Progress</p>
          <Progress value={weeklyProgress} />
        </div>
      </header>

      <Tabs defaultValue="skills">
        <TabsList>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="timer">Focus Timer</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="skills">
          <div className="grid md:grid-cols-2 gap-6">
            {skills.map(skill => (
              <Card key={skill.id}>
                <CardHeader>
                  <CardTitle>{skill.name}</CardTitle>
                  <p className="text-muted-foreground text-sm">XP: {skill.xp || 0}</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {skill.subskills?.map(sub => (
                    <div key={sub.id} className="flex justify-between">
                      <span>{sub.name}</span>
                      <span>{sub.xp || 0} XP</span>
                    </div>
                  ))}
                  <Input
                    placeholder="New subskill"
                    className="mt-2"
                    value={subskillInputs[skill.id] || ""}
                    onChange={(e) => setSubskillInputs({ ...subskillInputs, [skill.id]: e.target.value })}
                  />
                  <Button size="sm" className="mt-1" onClick={() => handleAddSubskill(skill.id)}>Add Subskill</Button>
                </CardContent>
              </Card>
            ))}
            <Card>
              <CardHeader>
                <CardTitle>Add New Skill</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Skill name"
                  className="mb-2"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                />
                <Button onClick={handleAddSkill}>Add Skill</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timer">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle><Timer className="inline w-5 h-5 mr-2" />Focus Timer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className=" mb-2 text-muted-foreground text-sm">Track time and earn XP based on focus.</p>
              <select
                className="mb-2 w-full border px-2 py-1 rounded"
                value={selectedSubskillId}
                onChange={(e) => setSelectedSubskillId(e.target.value)}
              >
                <option value="">Select Subskill</option>
                {skills.flatMap(skill =>
                  skill.subskills.map(sub => (
                    <option key={sub.id} value={sub.id}>{skill.name} - {sub.name}</option>
                  ))
                )}
              </select>
              <div className="flex gap-2 items-center">
                {!timerRunning ? (
                  <Button onClick={handleStart}>Start</Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={handleStop}>Stop</Button>
                    <span>{elapsedSeconds}s</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions">
          <p className="text-muted-foreground text-sm mb-4">Based on your current skills, try adding:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Card><CardContent className="p-4">TypeScript</CardContent></Card>
            <Card><CardContent className="p-4">Express.js</CardContent></Card>
            <Card><CardContent className="p-4">MongoDB</CardContent></Card>
          </div>
        </TabsContent>

        <TabsContent value="stats">
          <p className="text-muted-foreground text-sm mb-2">Weekly XP Progress (Mock)</p>
          <div className="bg-muted h-32 rounded-lg flex items-end gap-2 px-4 py-2">
            {[100, 60, 80, 30, 90, 40, 120].map((xp, i) => (
              <div key={i} className="bg-primary w-4" style={{ height: `${xp / 2}px` }} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
